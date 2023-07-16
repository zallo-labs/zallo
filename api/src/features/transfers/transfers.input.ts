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
    description: 'Not originating from an account transaction',
  })
  external?: boolean;
}

@InputType()
export class TransferSubscriptionInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  @Field(() => [TransferDirection], { nullable: true })
  directions?: TransferDirection[];

  @Field(() => Boolean, {
    nullable: true,
    description: 'Not originating from an account transaction',
  })
  external?: boolean;
}
