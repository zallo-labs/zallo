import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Address } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';

export enum TransferDirection {
  IN,
  OUT,
}
registerEnumType(TransferDirection, { name: 'TransferDirection' });

@InputType()
export class TransfersInput {
  @AddressField()
  account: Address;

  @Field(() => TransferDirection, { nullable: true })
  direction?: TransferDirection;

  @Field(() => Number, { nullable: true, defaultValue: 100 })
  skip: number;
}
