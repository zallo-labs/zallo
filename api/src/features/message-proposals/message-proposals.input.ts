import { Field, InputType } from '@nestjs/graphql';
import { Address, Hex } from 'lib';
import { TypedDataDefinition } from 'viem';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { TypedDataField } from '~/apollo/scalars/TypedData.scalar';

@InputType()
export class ProposeMessageInput {
  @AddressField()
  account: Address;

  @Field(() => String, { nullable: true, description: 'Optional if typedData is provided' })
  message?: string;

  @TypedDataField({ nullable: true })
  typedData?: TypedDataDefinition;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}
