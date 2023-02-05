import { ContractMethod } from '@gen/contract-method/contract-method.model';
import { Args, Info, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from '../util/prisma/prisma.service';
import { getSelect } from '~/util/select';
import { ContractMethodArgs } from './contract-methods.args';
import { ContractMethodsService } from './contract-methods.service';

@Resolver(() => ContractMethod)
export class ContractMethodsResolver {
  constructor(private service: ContractMethodsService, private prisma: PrismaService) {}

  @ResolveField(() => String)
  id(@Parent() c: ContractMethod): string {
    return `${c.contract}-${c.sighash}`;
  }

  @Query(() => ContractMethod, { nullable: true })
  async contractMethod(
    @Args() { contract, sighash }: ContractMethodArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<ContractMethod | null> {
    const selectArgs = getSelect(info);

    // Try get selector for contract
    const exactMatch = await this.prisma.asUser.contractMethod.findUnique({
      where: { contract_sighash: { contract, sighash } },
      ...selectArgs,
    });
    if (exactMatch) return exactMatch;

    // Otherwise try fetch the abi for the contract
    const fetchedInterface = await this.service.tryFetchAbi(contract);

    if (fetchedInterface) {
      await this.service.populateDbWithAbi(contract, fetchedInterface);

      const fragment = fetchedInterface.getFunction(sighash).format('json');
      return { contract, sighash, fragment };
    }

    // Fallback to finding the sighash from any contract
    return this.prisma.asUser.contractMethod.findFirst({
      where: { sighash },
      ...selectArgs,
    });
  }
}
