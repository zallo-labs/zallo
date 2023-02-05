import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { Contract } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Address } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { fetchJsonWithRetry } from '~/util/fetch';

const ETHERSCAN_API_URL = `https://api${
  CONFIG.chain.name === 'testnet' ? '-goerli' : ''
}.etherscan.io/api`;

const getEtherscanUrl = (args: string) =>
  `${ETHERSCAN_API_URL}?apikey=${CONFIG.etherscanApiKey}&${args}`;

interface EtherscanResp {
  message: 'OK' | 'NOTOK';
  result: string;
}

@Injectable()
export class ContractMethodsService {
  constructor(private prisma: PrismaService) {}

  async tryFetchAbi(addr: Address): Promise<Interface | undefined> {
    // return (await this.tryFetchEtherscanAbi(addr)) ?? (await this.tryFetchDecompiledAbi(addr));
    return undefined;
  }

  async populateDbWithAbi(contract: Address, contractInterface: Interface) {
    const fragments = Object.values(contractInterface.functions);

    await this.prisma.asUser.contractMethod.createMany({
      data: fragments.map((frag) => ({
        contract,
        sighash: contractInterface.getSighash(frag),
        fragment: frag.format('json'),
      })),
    });
  }

  private async tryFetchEtherscanAbi(addr: Address) {
    const resp: EtherscanResp | undefined = await fetchJsonWithRetry(
      getEtherscanUrl(`module=contract&action=getabi&address=${addr}`),
    );

    return resp?.message === 'OK' ? Contract.getInterface(JSON.parse(resp.result)) : undefined;
  }

  private async tryFetchDecompiledAbi(addr: Address) {
    const resp = await fetchJsonWithRetry(`https://eveem.org/code/${addr}.json`);

    return resp?.functions?.length
      ? Contract.getInterface(
          resp.functions.map((frag: { name: string }) => FunctionFragment.from(frag.name)),
        )
      : undefined;
  }
}
