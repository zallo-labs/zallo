import { Info, Parent, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { ContractFunctionInput } from './contract-functions.input';
import { ContractFunctionsService } from './contract-functions.service';
import { ContractFunction, AbiSourceConfidence } from './contract-functions.model';
import { match } from 'ts-pattern';
import { ComputedField } from '~/common/decorators/computed.decorator';
import e from '~/edgeql-js';
import { getShape } from '~/core/database';
import { Input } from '~/common/decorators/input.decorator';

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
