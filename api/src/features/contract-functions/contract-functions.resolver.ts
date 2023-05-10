import { Args, Info, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { ContractFunctionInput } from './contract-functions.args';
import { ContractFunctionsService } from './contract-functions.service';
import { ContractFunction, AbiSourceConfidence } from './contract-functions.model';
import { match } from 'ts-pattern';
import { ComputedField } from '~/decorators/computed.decorator';
import e from '~/edgeql-js';
import { getShape } from '../database/database.select';

@Resolver(() => ContractFunction)
export class ContractFunctionsResolver {
  constructor(private service: ContractFunctionsService) {}

  @Query(() => ContractFunction, { nullable: true })
  async contractFunction(
    @Args('args') args: ContractFunctionInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    return this.service.findUnique(args, getShape(info));
  }

  @ComputedField<typeof e.Function>(() => AbiSourceConfidence, { source: true })
  sourceConfidence(@Parent() { source }: ContractFunction): AbiSourceConfidence {
    return match(source)
      .with('Verified', () => AbiSourceConfidence.High)
      .exhaustive();
  }
}
