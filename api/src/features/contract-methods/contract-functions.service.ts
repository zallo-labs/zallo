import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ContractsService } from '../contracts/contracts.service';

@Injectable()
export class ContractFunctionsService {
  constructor(private prisma: PrismaService, private contracts: ContractsService) {}

  async findUnique<Res extends Prisma.ContractFunctionArgs>(
    contract: Address,
    selector: string,
    res?: Prisma.SelectSubset<Res, Prisma.ContractFunctionArgs>,
  ) {
    const getExact = () =>
      this.prisma.asUser.contractFunction.findUnique({
        where: { contractId_selector: { contractId: contract, selector } },
        ...res,
      });

    const exactMatch = await getExact();
    if (exactMatch) return exactMatch;

    // Otherwise try fetch the abi for the contract
    const fetched = await this.contracts.tryFetchAbi(contract, { select: { id: true } });
    if (fetched) return getExact();

    // Fallback to finding the sighash from any contract
    return this.prisma.asUser.contractFunction.findFirst({
      where: { selector },
      ...res,
    });
  }
}
