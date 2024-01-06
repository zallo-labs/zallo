import { Field, InputType } from '@nestjs/graphql';
import { TypedDataDefinition } from 'viem';

import { Hex, UAddress } from 'lib';
import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { TypedDataField } from '~/apollo/scalars/TypedData.scalar';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';

@InputType()
export class ProposeMessageInput {
  @UAddressField()
  account: UAddress;

  @Field(() => String, { nullable: true, description: 'Optional if typedData is provided' })
  message?: string;

  @TypedDataField({ nullable: true })
  typedData?: TypedDataDefinition;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => Date, { nullable: true })
  validFrom?: Date;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}
