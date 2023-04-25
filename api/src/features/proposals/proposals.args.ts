import { FindManyProposalArgs } from '@gen/proposal/find-many-proposal.args';
import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { Address, Hex } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import {
  Bytes32Field,
  Bytes32Scalar,
  BytesField,
  BytesScalar,
} from '~/apollo/scalars/Bytes.scalar';
import { Proposal } from '@gen/proposal/proposal.model';

@ArgsType()
export class UniqueProposalArgs {
  @Bytes32Field()
  id: string;
}

export enum ProposalState {
  Pending = 'pending',
  Executing = 'executing',
  Executed = 'executed',
}
registerEnumType(ProposalState, { name: 'ProposalState' });

@ArgsType()
export class ProposalsArgs extends FindManyProposalArgs {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => [ProposalState], { nullable: true })
  states?: ProposalState[];
}

export const PROPOSAL_SUBSCRIPTION = 'proposal';
export const ACCOUNT_PROPOSAL_SUB_TRIGGER = `${PROPOSAL_SUBSCRIPTION}.Account` as const;

export enum ProposalEvent {
  create,
  update,
  delete,
  execute,
  response,
}
registerEnumType(ProposalEvent, { name: 'ProposalEvent' });

export const PROPOSAL_PAYLOAD_SELECT = { id: true, accountId: true } as const;
export interface ProposalSubscriptionPayload {
  [PROPOSAL_SUBSCRIPTION]: Pick<Proposal, keyof typeof PROPOSAL_PAYLOAD_SELECT>;
  event: ProposalEvent;
}

@ArgsType()
export class ProposalSubscriptionFilters {
  @Field(() => [AddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts if no proposals are provided',
  })
  accounts?: Address[];

  @Field(() => [Bytes32Scalar], { nullable: true })
  proposals?: string[];

  @Field(() => [ProposalEvent], { nullable: true, description: 'Defaults to all events' })
  events?: ProposalEvent[];
}

@ArgsType()
export class ProposeArgs {
  @AddressField()
  account: Address;

  @AddressField()
  to: Address;

  @Uint256Field({ nullable: true, description: 'WEI' })
  value?: bigint;

  @BytesField({ nullable: true })
  data?: Hex;

  @Uint256Field({ nullable: true })
  nonce?: bigint;

  @Uint256Field({ nullable: true })
  gasLimit?: bigint;

  @AddressField({ nullable: true })
  feeToken?: Address;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}

@ArgsType()
export class ApproveArgs extends UniqueProposalArgs {
  @BytesField()
  signature: Hex;
}
