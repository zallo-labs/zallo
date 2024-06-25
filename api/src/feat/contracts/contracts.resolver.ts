import { Info, Query, Resolver } from '@nestjs/graphql';
import { ContractsService } from './contracts.service';
import { ContractInput } from './contracts.input';
import { GraphQLResolveInfo } from 'graphql';
import { Contract } from './contracts.model';
import { getShape } from '../../core/database/database.select';
import { Input } from '~/common/decorators/input.decorator';

@Resolver(() => Contract)
export class ContractsResolver {
  constructor(private service: ContractsService) {}

  @Query(() => Contract, { nullable: true })
  async contract(@Input() { contract }: ContractInput, @Info() info: GraphQLResolveInfo) {
    return this.service.select(contract, getShape(info));
  }
}
