import { Args, Info, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { getSelect } from '~/util/select';
import { ContractFunctionInput } from './contract-functions.args';
import { ContractFunctionsService } from './contract-functions.service';
import { ContractSourceConfidence } from './contract-functions.model';
import { match } from 'ts-pattern';
import { ContractFunction } from '@gen/contract-function/contract-function.model';

@Resolver(() => ContractFunction)
export class ContractFunctionsResolver {
  constructor(private service: ContractFunctionsService) {}

  @ResolveField(() => ContractSourceConfidence)
  sourceConfidence(@Parent() { source }: ContractFunction): ContractSourceConfidence {
    return match(source)
      .with('DECOMPILED', () => ContractSourceConfidence.Low)
      .with('STANDARD', () => ContractSourceConfidence.Medium)
      .with('VERIFIED', () => ContractSourceConfidence.High)
      .exhaustive();
  }

  @Query(() => ContractFunction, { nullable: true })
  async contractFunction(
    @Args('args') { contract, selector }: ContractFunctionInput,
    @Info() info: GraphQLResolveInfo,
  ): Promise<ContractFunction | null> {
    return this.service.findUnique(contract, selector, getSelect(info));
  }
}
