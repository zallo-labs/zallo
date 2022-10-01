import { ContractMethod } from '@gen/contract-method/contract-method.model';
import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Id, toId } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { getSelect } from '~/util/select';
import { ContractMethodArgs } from './contract-methods.args';
import { ContractMethodsService } from './contract-methods.service';

@Resolver(() => ContractMethod)
export class ContractMethodsResolver {
  constructor(
    private service: ContractMethodsService,
    private prisma: PrismaService,
  ) {}

  @ResolveField(() => String)
  id(@Parent() c: ContractMethod): Id {
    return toId(`${c.contract}-${c.sighash}`);
  }

  @Query(() => ContractMethod, { nullable: true })
  async contractMethod(
    @Args() { contract, sighash }: ContractMethodArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<ContractMethod | undefined> {
    const selectArgs = getSelect(info);

    // Try get selector for contract
    const exactMatch = await this.prisma.contractMethod.findUnique({
      where: { contract_sighash: { contract, sighash } },
      ...selectArgs,
    });
    if (exactMatch) return exactMatch;

    const fetchedInterface = await this.service.tryFetchAbi(contract);

    if (fetchedInterface) {
      await this.service.populateDbWithAbi(contract, fetchedInterface);

      const fragment = fetchedInterface.getFunction(sighash).format('json');
      return { contract, sighash, fragment };
    }

    // Otherwise try find the sighash in the db from any contract
    const sighashMatch = await this.prisma.contractMethod.findFirst({
      where: { sighash },
      ...selectArgs,
    });
    if (sighashMatch) return sighashMatch;

    return undefined;
  }
}
