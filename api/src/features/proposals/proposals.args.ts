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
import { SetField } from '~/apollo/scalars/SetField';
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
  // Only show the specified accounts
  @SetField(() => AddressScalar, { nullable: true })
  accounts?: Set<Address>;

  @SetField(() => ProposalState, { nullable: true })
  states?: Set<ProposalState>;

  @Field(() => Boolean, { nullable: true, description: 'User is required to take action' })
  actionRequired?: boolean;
}

export const PROPOSAL_SUBSCRIPTION = 'proposal';
export const ACCOUNT_PROPOSAL_SUB_TRIGGER = `${PROPOSAL_SUBSCRIPTION}.Account`;

export enum ProposalEvent {
  create,
  update,
  delete,
  response,
}
registerEnumType(ProposalEvent, { name: 'ProposalEvent' });

export interface ProposalSubscriptionPayload {
  [PROPOSAL_SUBSCRIPTION]: Proposal;
  event: ProposalEvent;
}

@ArgsType()
export class ProposalSubscriptionFilters {
  @SetField(() => AddressScalar, {
    nullable: true,
    description: 'Defaults to user accounts if no proposals are provided',
  })
  accounts?: Set<Address>;

  @SetField(() => Bytes32Scalar, { nullable: true })
  proposals?: Set<string>;

  @SetField(() => ProposalEvent, { nullable: true, description: 'Defaults to all events' })
  events?: Set<ProposalEvent>;
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

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}

@ArgsType()
export class ApproveArgs extends UniqueProposalArgs {
  @BytesField()
  signature: string;
}
