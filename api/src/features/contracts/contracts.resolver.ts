import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { ContractsService } from './contracts.service';
import { ContractInput } from './contracts.args';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { Contract } from './contracts.model';

@Resolver(() => Contract)
export class ContractsResolver {
  constructor(private service: ContractsService) {}

  @Query(() => Contract, { nullable: true })
  async contract(
    @Args('args') { contract }: ContractInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Contract | null> {
    return this.service.findUniqueOrTryFetch(contract, getSelect(info));
  }
}
