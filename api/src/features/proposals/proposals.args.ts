import { FindManyProposalArgs } from '@gen/proposal/find-many-proposal.args';
import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { BigNumber } from 'ethers';
import { Address, QuorumKey, TxOptions, TxSalt } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Uint256BnField } from '~/apollo/scalars/BigNumber.scalar';
import { QuorumKeyField } from '~/apollo/scalars/QuorumKey.sclar';
import {
  Bytes32Field,
  Bytes32Scalar,
  Bytes8Field,
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

  states?: ProposalState[];

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
export class ProposeArgs implements TxOptions {
  @AddressField()
  account: Address;

  @QuorumKeyField({
    nullable: true,
    description:
      'Defaults to quorum with the least amount of approvers, followed by the lowest id (by lexical comparison)',
  })
  quorumKey?: QuorumKey;

  @AddressField()
  to: Address;

  // Wei
  @Uint256BnField({ nullable: true })
  value?: BigNumber;

  @BytesField({ nullable: true })
  data?: string;

  @Bytes8Field({ nullable: true })
  salt?: TxSalt;

  @Uint256BnField({ nullable: true })
  gasLimit?: BigNumber;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: string;
}

@ArgsType()
export class ApproveArgs extends UniqueProposalArgs {
  @BytesField()
  signature: string;
}
