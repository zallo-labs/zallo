import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { Node } from '~/decorators/interface.decorator';
import { DatabaseService } from '../database/database.service';
import { GraphQLResolveInfo } from 'graphql';
import e from '~/edgeql-js';
import { getShape } from '../database/database.select';
import { NodesArgs } from './nodes.input';
import * as uuid from 'uuid';

@Resolver(() => Node)
export class NodesResolver {
  constructor(private db: DatabaseService) {}

  @Query(() => Node, { nullable: true })
  async node(@Args() { id }: NodesArgs, @Info() info: GraphQLResolveInfo) {
    if (!uuid.validate(id)) throw new Error('Invalid ID');

    return this.db.query(
      e.select(e.Object, (n) => ({
        filter_single: { id },
        ...getShape(info)(n),
      })),
    );
  }
}
