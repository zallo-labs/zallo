import { Info, Parent, Resolver } from '@nestjs/graphql';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';
import { Operation, OperationFunction } from './operations.model';
import { GraphQLResolveInfo } from 'graphql';
import { OperationsService } from './operations.service';

@Resolver(() => Operation)
export class OperationsResolver {
  constructor(private service: OperationsService) {}

  @ComputedField<typeof e.Operation>(
    () => OperationFunction,
    { to: true, value: true, data: true },
    { nullable: true },
  )
  async function(@Parent() { to, value, data }: Operation, @Info() info: GraphQLResolveInfo) {
    return this.service.decode({ to, value, data });
  }
}
