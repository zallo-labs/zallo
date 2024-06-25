import { Field, InputType } from '@nestjs/graphql';
import { UAddress, Hex } from 'lib';
import { TypedDataDefinition } from 'viem';
import { UAddressField } from '~/common/scalars/UAddress.scalar';
import { BytesScalar } from '~/common/scalars/Bytes.scalar';
import { TypedDataField } from '~/common/scalars/TypedData.scalar';
import { DappMetadataInput } from '../proposals/proposals.input';
import { UrlField } from '~/common/scalars/Url.scalar';

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

  @UrlField({ nullable: true })
  icon?: string;

  @Field(() => DappMetadataInput, { nullable: true })
  dapp?: DappMetadataInput;

  @Field(() => Date, { nullable: true })
  timestamp?: Date;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}
