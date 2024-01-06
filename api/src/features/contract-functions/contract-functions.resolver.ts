import { Info, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { match } from 'ts-pattern';

import { ComputedField } from '~/decorators/computed.decorator';
import { Input } from '~/decorators/input.decorator';
import e from '~/edgeql-js';
import { getShape } from '../database/database.select';
import { ContractFunctionInput } from './contract-functions.input';
import { AbiSourceConfidence, ContractFunction } from './contract-functions.model';
import { ContractFunctionsService } from './contract-functions.service';

@Resolver(() => ContractFunction)
export class ContractFunctionsResolver {
  constructor(private service: ContractFunctionsService) {}

  @Query(() => ContractFunction, { nullable: true })
  async contractFunction(@Input() input: ContractFunctionInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(input, getShape(info));
  }

  @ComputedField<typeof e.Function>(() => AbiSourceConfidence, { source: true })
  sourceConfidence(@Parent() { source }: ContractFunction): AbiSourceConfidence {
    return match(source)
      .with('Verified', () => AbiSourceConfidence.High)
      .exhaustive();
  }
}
