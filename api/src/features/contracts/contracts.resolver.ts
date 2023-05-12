import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { ContractsService } from './contracts.service';
import { ContractInput } from './contracts.args';
import { GraphQLResolveInfo } from 'graphql';
import { Contract } from './contracts.model';
import { getShape } from '../database/database.select';

@Resolver(() => Contract)
export class ContractsResolver {
  constructor(private service: ContractsService) {}

  @Query(() => Contract, { nullable: true })
  async contract(@Args('input') { contract }: ContractInput, @Info() info: GraphQLResolveInfo) {
    return this.service.selectUnique(contract, getShape(info));
  }
}
