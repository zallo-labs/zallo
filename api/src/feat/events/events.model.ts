import { Field, InterfaceType, createUnionType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Transfer, TransferApproval } from '../transfers/transfers.model';
import { makeUnionTypeResolver } from '~/core/database';
import e from '~/edgeql-js';
import { Bytes32Field } from '~/common/scalars/Bytes.scalar';
import { Hex } from 'lib';
import { Node, NodeInterface } from '~/common/decorators/interface.decorator';

@NodeInterface()
export class Event extends Node {
  @Bytes32Field()
  systxHash: Hex;

  @Field(() => GraphQLBigInt)
  block: bigint;

  @Field(() => Number)
  logIndex: number;

  @Field(() => Date)
  timestamp: Date;
}

// export type Event = typeof Event;
// export const Event = createUnionType({
//   name: 'Event',
//   types: () => [Transfer, TransferApproval] as const,
//   resolveType: makeUnionTypeResolver([
//     [e.Transfer, Transfer],
//     [e.TransferApproval, TransferApproval],
//   ]),
// });
