import { Field, InputType } from '@nestjs/graphql';
import { UAddress, Hex } from 'lib';
import { TypedDataDefinition } from 'viem';
import { UAddressField } from '~/apollo/scalars/UAddress.scalar';
import { BytesScalar } from '~/apollo/scalars/Bytes.scalar';
import { TypedDataField } from '~/apollo/scalars/TypedData.scalar';
import { DappMetadataInput } from '../proposals/proposals.input';
import { UrlField } from '~/apollo/scalars/Url.scalar';

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
  validFrom?: Date;

  @Field(() => BytesScalar, { nullable: true, description: 'Approve the proposal' })
  signature?: Hex;
}
