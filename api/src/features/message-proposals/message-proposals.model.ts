import { Field, ObjectType } from '@nestjs/graphql';
import { Proposal } from '../proposals/proposals.model';
import { Bytes32Field } from '~/apollo/scalars/Bytes.scalar';
import { Hex } from 'lib';

@ObjectType({ implements: () => [Proposal] })
export class MessageProposal extends Proposal {
  @Field(() => String)
  message: string;

  @Bytes32Field({ nullable: true })
  signature?: Hex;
}
