import { Injectable } from '@nestjs/common';
import { DatabaseService } from '~/core/database';
import { ProposeMessageInput } from './messages.input';
import { ApproveInput, ProposalEvent } from '../proposals/proposals.input';
import {
  TypedDataDefinition,
  concat,
  hashMessage,
  hashTypedData,
  hexToString,
  keccak256,
} from 'viem';
import e, { Set } from '~/edgeql-js';
import { selectAccount } from '../accounts/accounts.util';
import { ProposalsService, UniqueProposal } from '../proposals/proposals.service';
import {
  Hex,
  UUID,
  asAddress,
  asApproval,
  asHex,
  asMessageTypedData,
  asUAddress,
  asUUID,
  encodeMessageSignature,
  isHex,
  mapAsync,
} from 'lib';
import { ShapeFunc } from '~/core/database';
import { policyStateAsPolicy, PolicyShape } from '../policies/policies.util';
import { NetworksService } from '~/core/networks/networks.service';
import { UserInputError } from '@nestjs/apollo';
import { ethers } from 'ethers';
import _ from 'lodash';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';
import { PoliciesService } from '../policies/policies.service';
import { $uuid } from '~/edgeql-js/modules/std';
import { $ } from 'edgedb';

export const selectMessage = (id: UUID | Hex) =>
  e.select(e.Message, () => ({ filter_single: isHex(id) ? { hash: id } : { id } }));

export const selectMessage2 = (id: Set<$uuid, $.Cardinality.One>) =>
  e.select(e.Message, () => ({ filter_single: { id } }));

@Injectable()
export class MessagesService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private proposals: ProposalsService,
    private policies: PoliciesService,
  ) {}

  async selectUnique(id: UniqueProposal, shape?: ShapeFunc<typeof e.Message>) {
    return this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Message, (p) => ({
          ...shape?.(p),
          filter_single: { id },
        })),
      { id },
    );
  }

  async propose({
    account,
    message: messageInput,
    typedData,
    label,
    icon,
    dapp,
    timestamp = new Date(),
    signature,
  }: ProposeMessageInput) {
    if (!messageInput && !typedData)
      throw new UserInputError('Either message or typedData is required');

    const [message, messageHash] = (() => {
      if (typedData) {
        const m = this.typedDataAsMessage(typedData);
        return [hexToString(m), keccak256(m)];
      } else {
        // Personal message
        const m = isHex(messageInput) ? hexToString(messageInput) : messageInput!;
        return [m, hashMessage(m)];
      }
    })();

    const hash = hashTypedData(asMessageTypedData(account, messageHash));
    const { policy, validationErrors } = await this.policies.best(account, 'message');

    const existingMessage = selectMessage(hash);
    const { proposal, inserted } = await this.db.query(
      e.select({
        // upsert can't be used as exclusive hash constraint exists on parent type (Proposal)
        proposal: e.assert_exists(
          e.op(
            existingMessage,
            '??',
            e.insert(e.Message, {
              account: selectAccount(account),
              policy,
              validationErrors,
              hash,
              messageHash,
              message,
              typedData,
              label,
              icon,
              timestamp,
              ...(dapp && {
                dapp: {
                  name: dapp.name,
                  url: dapp.url,
                  icons: dapp.icons,
                },
              }),
            }),
          ),
        ),
        inserted: e.op('not', e.op('exists', existingMessage)),
      }),
    );

    const id = asUUID(proposal.id);
    if (inserted) this.proposals.event({ id, account }, ProposalEvent.create);

    if (signature) await this.approve({ id, signature });

    return { id };
  }

  async approve(input: ApproveInput) {
    await this.proposals.approve(input);
    await this.trySign(input.id);
  }

  async remove(proposal: UUID) {
    const { account } = await this.db.queryWith(
      { id: e.uuid },
      ({ id }) => {
        const m = selectMessage2(id);
        return e.with(
          [m],
          e.select({
            account: e.assert_exists(m.account.address),
            deleted: e.delete(m),
          }),
        );
      },
      { id: proposal },
    );

    this.proposals.event({ id: proposal, account: asUAddress(account) }, ProposalEvent.delete);

    return proposal;
  }

  private async trySign(id: UUID) {
    const proposal = await this.db.queryWith(
      { id: e.uuid },
      ({ id }) =>
        e.select(e.Message, () => ({
          filter_single: { id },
          hash: true,
          message: true,
          typedData: true,
          signature: true,
          approvals: {
            approver: { address: true },
            signature: true,
          },
          account: {
            address: true,
            policies: PolicyShape,
          },
        })),
      { id },
    );
    if (!proposal) return undefined;

    if (proposal.signature) return proposal.signature as Hex;

    const policy = policyStateAsPolicy(
      proposal?.account.policies.find((p) => proposal.approvals.length >= p.threshold) ?? null,
    );
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
    ).filter(Boolean);

    const signature = encodeMessageSignature({
      message: (proposal.typedData as TypedDataDefinition | null) ?? proposal.message,
      policy,
      approvals,
    });

    await this.db.queryWith(
      { id: e.uuid, signature: e.Bytes },
      ({ id, signature }) =>
        e.update(e.Message, () => ({
          filter_single: { id },
          set: { signature },
        })),
      { id, signature },
    );

    await this.proposals.event({ id, account }, ProposalEvent.signed);

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
        ).filter(Boolean),
      ),
    );
  }
}
