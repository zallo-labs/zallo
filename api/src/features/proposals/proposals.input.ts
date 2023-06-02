import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Uint256Field } from '~/apollo/scalars/BigInt.scalar';
import {
  Bytes32Field,
  Bytes32Scalar,
  BytesField,
  BytesScalar,
} from '~/apollo/scalars/Bytes.scalar';
import { TransactionProposalStatus } from './proposals.model';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';

@InputType()
export class ProposalInput {
  @Bytes32Field()
  hash: Hex;
}

@InputType()
export class ProposalsInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => [TransactionProposalStatus], { nullable: true })
  statuses?: TransactionProposalStatus[];
}

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

@InputType()
export class ProposalSubscriptionInput {
  @Field(() => [Bytes32Scalar], { nullable: true })
  proposals?: Hex[];

  @Field(() => [AddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts if no proposals are provided',
  })
  accounts?: Address[];

  @Field(() => [ProposalEvent], { nullable: true, description: 'Defaults to all events' })
  events?: ProposalEvent[];
}

@InputType()
export class ProposeInput {
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
export class ApproveInput extends ProposalInput {
  @BytesField()
  signature: Hex;
}

@InputType()
export class UpdateProposalInput extends ProposalInput {
  @PolicyKeyField({ nullable: true })
  policy?: PolicyKey | null;

  @AddressField({ nullable: true })
  feeToken?: Address;
}
