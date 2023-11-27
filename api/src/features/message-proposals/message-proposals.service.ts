import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProposeMessageInput } from './message-proposals.input';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { TypedDataDefinition, concat, hashMessage, hexToString, keccak256 } from 'viem';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import {
  Hex,
  asAddress,
  asApproval,
  asHex,
  asUAddress,
  encodeTransactionSignature,
  isHex,
  isPresent,
  mapAsync,
} from 'lib';
import { ShapeFunc } from '../database/database.select';
import { policyStateAsPolicy, policyStateShape } from '../policies/policies.util';
import { NetworksService } from '../util/networks/networks.service';
import { UserInputError } from '@nestjs/apollo';
import { ethers } from 'ethers';
import _ from 'lodash';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';

@Injectable()
export class MessageProposalsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private proposals: ProposalsService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.MessageProposal>) {
    return this.db.query(
      e.select(e.MessageProposal, (p) => ({
        ...shape?.(p),
        filter_single: isHex(id) ? { hash: id } : { id },
      })),
    );
  }

  async propose({
    account,
    message: messageInput,
    typedData,
    label,
    iconUri,
    validFrom = new Date(),
    signature,
  }: ProposeMessageInput) {
    if (!messageInput && !typedData)
      throw new UserInputError('Either message or typedData is required');

    const [message, hash] = (() => {
      if (typedData) {
        const m = this.typedDataAsMessage(typedData);
        return [hexToString(m), keccak256(m)];
      } else {
        // Personal message
        const m = isHex(messageInput) ? hexToString(messageInput) : messageInput!;
        return [m, hashMessage(m)];
      }
    })();

    // upsert can't be used as exclusive hash constraint exists on parent type (Proposal)
    const proposal =
      (await this.db.query(e.select(e.MessageProposal, () => ({ filter_single: { hash } })))) ??
      (await (async () => {
        const p = await this.db.query(
          e.insert(e.MessageProposal, {
            account: selectAccount(account),
            hash,
            message,
            typedData,
            label,
            iconUri,
            validFrom,
          }),
        );

        await this.proposals.publishProposal({ account, hash }, ProposalEvent.create);

        return p;
      })());

    if (signature) await this.approve({ hash, signature });

    return proposal;
  }

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    await this.trySign(input.hash);
  }

  async remove(proposal: Hex) {
    return this.db.query(
      e.delete(e.select(e.MessageProposal, () => ({ filter_single: { hash: proposal } }))).id,
    );
  }

  private async trySign(proposalHash: Hex) {
    const proposal = await this.db.query(
      e.select(e.MessageProposal, () => ({
        filter_single: { hash: proposalHash },
        signature: true,
        approvals: {
          approver: { address: true },
          signature: true,
        },
        account: {
          address: true,
          policies: {
            key: true,
            state: policyStateShape,
          },
        },
      })),
    );
    if (!proposal) return undefined;

    if (proposal.signature) return proposal.signature as Hex;

    const satisfiedPolicy = proposal?.account.policies.find(
      (p) => p.state && proposal.approvals.length >= p.state.threshold,
    );
    const policy = satisfiedPolicy
      ? policyStateAsPolicy(satisfiedPolicy.key, satisfiedPolicy.state)
      : undefined;
    if (!policy) return undefined;

    // TODO: handle expired approvals
    const account = asUAddress(proposal.account.address);
    const network = this.networks.for(account);
    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        asApproval({
          hash: proposalHash,
          approver: asAddress(a.approver.address),
          signature: asHex(a.signature),
          network,
        }),
      )
    ).filter(isPresent);

    const signature = encodeTransactionSignature(0n, policy, approvals);

    await this.db.query(
      e.update(e.MessageProposal, () => ({
        filter_single: { hash: proposalHash },
        set: { signature },
      })),
    );

    await this.proposals.publishProposal({ hash: proposalHash, account }, ProposalEvent.approved);

    return signature;
  }

  private typedDataAsMessage(typedData: TypedDataDefinition): Hex {
    return asHex(
      concat(
        (
          [
            '0x1901',
            typedData.domain && ethers.TypedDataEncoder.hashDomain(typedData.domain),
            ethers.TypedDataEncoder.from(
              _.omit(typedData.types as WritableDeep<typeof typedData.types>, 'EIP712Domain'),
            ).hash(typedData.message),
          ] as Hex[]
        ).filter(isPresent),
      ),
    );
  }
}
