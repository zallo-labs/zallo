import { Field, ObjectType } from '@nestjs/graphql';
import { TypedDataDefinition } from 'viem';

import { Hex } from 'lib';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { TypedDataField } from '~/apollo/scalars/TypedData.scalar';
import { Proposal } from '../proposals/proposals.model';

@ObjectType({ implements: () => [Proposal] })
export class MessageProposal extends Proposal {
  @Field(() => String)
  message: string;

  @TypedDataField({ nullable: true })
  typedData?: TypedDataDefinition;

  @Bytes32Field({ nullable: true })
  signature?: Hex;
}
