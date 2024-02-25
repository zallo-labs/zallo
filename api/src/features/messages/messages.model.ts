import { Field, ObjectType } from '@nestjs/graphql';
import { Proposal } from '../proposals/proposals.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Hex } from 'lib';
import { TypedDataField } from '~/apollo/scalars/TypedData.scalar';
import { TypedDataDefinition } from 'viem';

@ObjectType({ implements: () => [Proposal] })
export class Message extends Proposal {
  @Bytes32Field()
  signedHash: Hex;

  @Field(() => String)
  message: string;

  @TypedDataField({ nullable: true })
  typedData?: TypedDataDefinition;

  @Bytes32Field({ nullable: true })
  signature?: Hex;
}
