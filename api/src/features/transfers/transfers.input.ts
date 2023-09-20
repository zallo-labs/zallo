import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressScalar } from '~/apollo/scalars/Address.scalar';

export enum TransferDirection {
  In = 'In',
  Out = 'Out',
}
registerEnumType(TransferDirection, { name: 'TransferDirection' });

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
