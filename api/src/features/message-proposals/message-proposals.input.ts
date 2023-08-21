import { Field, InputType } from '@nestjs/graphql';
import { Address, Hex } from 'lib';
import { AddressField } from '~/apollo/scalars/Address.scalar';
import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';

@InputType()
export class ProposeMessageInput {
  @AddressField()
  account: Address;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  iconUri?: string;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}
