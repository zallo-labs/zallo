import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey, UAddress, UUID } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field, BytesField } from '~/apollo/scalars/Bytes.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { UAddressScalar } from '~/apollo/scalars/UAddress.scalar';
import { UUIDField, UUIDScalar } from '~/apollo/scalars/Uuid.scalar';

@InputType()
export class UniqueProposalInput {
  @UUIDField()
  id: UUID;
}

@InputType()
export class ProposalInput {
  @UUIDField({ nullable: true })
  id?: UUID;

  @Bytes32Field({ nullable: true })
  hash?: Hex;
}

@InputType()
export class ProposalsInput {
  @Field(() => [UAddressScalar], { nullable: true })
  accounts?: UAddress[];

  @Field(() => Boolean, { nullable: true })
  pending?: boolean;
}

@InputType()
export class ApproveInput extends UniqueProposalInput {
  @AddressField({ nullable: true, description: 'Defaults to current approver' })
  approver?: Address;

  @BytesField()
  signature: Hex;
}

@InputType()
export class UpdateProposalInput extends UniqueProposalInput {
  @PolicyKeyField({ nullable: true })
  policy?: PolicyKey | null;
}

@InputType()
export class LabelProposalRiskInput extends UniqueProposalInput {
  @Field(() => Risk)
  risk: Risk;
}

export enum Risk {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}
registerEnumType(Risk, { name: 'Risk' });

export enum ProposalEvent {
  create,
  update,
  approval,
  rejection,
  delete,
  approved,
  submitted,
  executed,
}
registerEnumType(ProposalEvent, { name: 'ProposalEvent' });

@InputType()
export class ProposalSubscriptionInput {
  @Field(() => [UUIDScalar], { nullable: true })
  proposals?: UUID[];

  @Field(() => [UAddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts if no proposals are provided',
  })
  accounts?: UAddress[];

  @Field(() => [ProposalEvent], { nullable: true, description: 'Defaults to all events' })
  events?: ProposalEvent[];
}
