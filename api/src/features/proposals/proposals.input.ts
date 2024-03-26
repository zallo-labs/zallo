import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { Address, Hex, PolicyKey, UAddress, UUID } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { Bytes32Field, BytesField } from '~/apollo/scalars/Bytes.scalar';
import { IdField } from '~/apollo/scalars/Id.scalar';
import { PolicyKeyField } from '~/apollo/scalars/PolicyKey.scalar';
import { UAddressScalar } from '~/apollo/scalars/UAddress.scalar';
import { UrlField, UrlScalar } from '~/apollo/scalars/Url.scalar';

@InputType()
export class UniqueProposalInput {
  @IdField()
  id: UUID;
}

@InputType()
export class ProposalInput {
  @Field(() => ID, { nullable: true })
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
  policy?: PolicyKey;
}

export enum ProposalEvent {
  create,
  update,
  approval,
  rejection,
  delete,
  signed,
  submitted,
  executed,
  scheduled,
  cancelled,
  simulated,
}
registerEnumType(ProposalEvent, { name: 'ProposalEvent' });

@InputType()
export class ProposalUpdatedInput {
  @Field(() => [ID], { nullable: true })
  proposals?: UUID[];

  @Field(() => [UAddressScalar], {
    nullable: true,
    description: 'Defaults to user accounts if no proposals are provided',
  })
  accounts?: UAddress[];

  @Field(() => [ProposalEvent], { nullable: true, description: 'Defaults to all events' })
  events?: ProposalEvent[];
}

@InputType()
export class DappMetadataInput {
  @Field(() => String)
  name: string;

  @UrlField()
  url: string;

  @Field(() => [UrlScalar])
  icons: string[];
}
