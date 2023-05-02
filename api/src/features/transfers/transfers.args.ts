import { TransferDirection } from '@gen/prisma/transfer-direction.enum';
import { Field, InputType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

@InputType()
export class TransfersInput {
  @AddressField()
  account: Address;

  direction?: TransferDirection;

  @Field(() => Number, { nullable: true, defaultValue: 100 })
  skip: number;
}
