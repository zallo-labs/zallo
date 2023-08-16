import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address, Hex } from 'lib';
import { AddressField, AddressScalar } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field, Bytes32Scalar, BytesField } from '~/apollo/scalars/Bytes.scalar';

@InputType()
export class ProposalInput {
  @Bytes32Field()
  hash: Hex;
}

@InputType()
export class ProposalsInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => Boolean, { nullable: true })
  pending?: boolean;
}

@InputType()
export class ApproveInput extends ProposalInput {
  @AddressField({ nullable: true, description: 'Defaults to current approver' })
  approver?: Address;

  @BytesField()
  signature: Hex;
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
