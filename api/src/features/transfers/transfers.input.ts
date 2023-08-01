import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';
import { TransferDirection } from './transfers.model';

@InputType()
export class TransfersInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => TransferDirection, { nullable: true })
  direction?: TransferDirection;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Originating from an account transaction',
  })
  internal?: boolean;
}

@InputType()
export class TransferSubscriptionInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => TransferDirection, { nullable: true })
  direction?: TransferDirection;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Originating from an account transaction',
  })
  internal?: boolean;
}
