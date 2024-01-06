import { Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';

import { Input } from '~/decorators/input.decorator';
import { getShape } from '../database/database.select';
import { ContractInput } from './contracts.input';
import { Contract } from './contracts.model';
import { ContractsService } from './contracts.service';

@Resolver(() => Contract)
export class ContractsResolver {
  constructor(private service: ContractsService) {}

  @Query(() => Contract, { nullable: true })
  async contract(@Input() { contract }: ContractInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(contract, getShape(info));
  }
}
