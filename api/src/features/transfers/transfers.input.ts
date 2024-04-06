import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { UAddress } from 'lib';
import { UAddressScalar } from '~/apollo/scalars/UAddress.scalar';

export enum TransferDirection {
  In = 'In',
  Out = 'Out',
}
registerEnumType(TransferDirection, { name: 'TransferDirection' });

@InputType()
export class TransfersInput {
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
  @Field(() => [UAddressScalar], { nullable: true })
  accounts?: UAddress[];

  @Field(() => TransferDirection, { nullable: true })
  direction?: TransferDirection;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Originating from an account transaction',
  })
  internal?: boolean;
}
