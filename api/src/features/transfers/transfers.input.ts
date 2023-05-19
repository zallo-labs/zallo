import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';
import { TransferDirection } from './transfers.model';

@InputType()
export class TransfersInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  direction?: TransferDirection;
}

@InputType()
export class TransferSubscriptionInput {
  @Field(() => [AddressScalar], { nullable: true })
  accounts?: Address[];

  directions?: TransferDirection[];
}
