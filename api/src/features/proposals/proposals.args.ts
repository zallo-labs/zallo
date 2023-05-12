import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address, Hex } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import {
  Bytes32Field,
  Bytes32Scalar,
  BytesField,
  BytesScalar,
} from '~/apollo/scalars/Bytes.scalar';
import { TransactionProposalStatus } from './proposals.model';

@ArgsType()
export class UniqueProposalArgs {
  @Bytes32Field()
  hash: Hex;
}

@ArgsType()
export class ProposalsArgs {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => [TransactionProposalStatus], { nullable: true })
  statuses?: TransactionProposalStatus[];
}

export const PROPOSAL_SUBSCRIPTION = 'proposal';
export const ACCOUNT_PROPOSAL_SUB_TRIGGER = `${PROPOSAL_SUBSCRIPTION}.Account` as const;

export enum ProposalEvent {
  create,
  update,
  approval,
  rejection,
  delete,
  submitted,
  executed,
}
registerEnumType(ProposalEvent, { name: 'ProposalEvent' });

export interface ProposalSubscriptionPayload {
  [PROPOSAL_SUBSCRIPTION]: { hash: string; account: string };
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

@InputType()
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

@InputType()
export class ApproveArgs extends UniqueProposalArgs {
  @BytesField()
  signature: Hex;
}
