import { Field, InputType } from '@nestjs/graphql';
import { UAddress } from 'lib';
import { UAddressScalar } from '~/common/scalars/UAddress.scalar';

@InputType()
export class TransfersInput {
  @Field(() => Boolean, { nullable: true })
  incoming?: boolean;

  @Field(() => Boolean, { nullable: true })
  outgoing?: boolean;

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

  @Field(() => Boolean, { nullable: true })
  incoming?: boolean;

  @Field(() => Boolean, { nullable: true })
  outgoing?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Originating from an account transaction',
  })
  internal?: boolean;
}
