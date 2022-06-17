import { Injectable } from '@nestjs/common';
import CONFIG from 'config';
import { Contract } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Address } from 'lib';
import { PrismaService } from 'nestjs-prisma';
import { fetch, fetchJson } from '~/util/fetch';

const ETHERSCAN_API_URL = `https://api${
  CONFIG.chain.name === 'testnet' ? '-goerli' : ''
}.etherscan.io/api`;

const getEtherscanUrl = (args: string) =>
  `${ETHERSCAN_API_URL}?apikey=${CONFIG.providers.etherscan}&${args}`;

interface Resp {
  message: 'OK' | 'NOTOK';
  result: string;
}

@Injectable()
export class ContractMethodsService {
  constructor(private prisma: PrismaService) {}

  async tryFetchAbi(addr: Address): Promise<Interface | undefined> {
    return (
      (await this.tryFetchEtherscanAbi(addr)) ??
      (await this.tryFetchDecompiledAbi(addr))
    );
  }

  async populateDbWithAbi(contract: Address, contractInterface: Interface) {
    const fragments = Object.values(contractInterface.functions);

    await this.prisma.contractMethod.createMany({
      data: fragments.map((frag) => ({
        contract,
        sighash: contractInterface.getSighash(frag),
        fragment: frag.format('json'),
      })),
    });
  }

  private async tryFetchEtherscanAbi(addr: Address) {
    const resp: Resp | undefined = await fetchJson(
      getEtherscanUrl(`module=contract&action=getabi&address=${addr}`),
    );

    return resp?.message === 'OK'
      ? Contract.getInterface(JSON.parse(resp.result))
      : undefined;
  }

  private async tryFetchDecompiledAbi(addr: Address) {
    const resp = await fetchJson(`https://eveem.org/code/${addr}.json`);

    return resp?.functions?.length
      ? Contract.getInterface(
          resp.functions.map((frag) => FunctionFragment.from(frag.name)),
        )
      : undefined;
  }
}
