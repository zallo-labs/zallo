import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import _ from 'lodash';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';
import { concat, hashMessage, hexToString, keccak256, TypedDataDefinition } from 'viem';

import {
  asAddress,
  asApproval,
  asHex,
  asUAddress,
  asUUID,
  encodeMessageSignature,
  Hex,
  isHex,
  isPresent,
  mapAsync,
  UUID,
} from 'lib';
import e from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import { policyStateAsPolicy, policyStateShape } from '../policies/policies.util';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import { NetworksService } from '../util/networks/networks.service';
import { ProposeMessageInput } from './message-proposals.input';

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

        await this.proposals.publishProposal({ id: asUUID(p.id), account }, ProposalEvent.create);

        return p;
      })());
    const id = asUUID(proposal.id);

    if (signature) await this.approve({ id, signature });

    return { id };
  }

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    await this.trySign(input.id);
  }

  async remove(proposal: UUID) {
    return this.db.query(
      e.delete(e.select(e.MessageProposal, () => ({ filter_single: { id: proposal } }))).id,
    );
  }

  private async trySign(id: UUID) {
    const proposal = await this.db.query(
      e.select(e.MessageProposal, () => ({
        filter_single: { id },
        hash: true,
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
    const network = this.networks.get(account);
    const approvals = (
      await mapAsync(proposal.approvals, (a) =>
        asApproval({
          hash: asHex(proposal.hash),
          approver: asAddress(a.approver.address),
          signature: asHex(a.signature),
          network,
        }),
      )
    ).filter(isPresent);

    const signature = encodeMessageSignature({ policy, approvals });

    await this.db.query(
      e.update(e.MessageProposal, () => ({
        filter_single: { id },
        set: { signature },
      })),
    );

    await this.proposals.publishProposal({ id, account }, ProposalEvent.approved);

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
