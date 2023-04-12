import { Injectable } from '@nestjs/common';
import { CONFIG } from '~/config';
import { Contract } from 'ethers';
import { FunctionFragment } from 'ethers/lib/utils';
import { ACCOUNT_INTERFACE, Address, ChainName, asSelector } from 'lib';
import { PrismaService } from '../util/prisma/prisma.service';
import { fetchJsonWithRetry } from '~/util/fetch';
import { AbiSource, Prisma } from '@prisma/client';
import { JsonFragment } from '@ethersproject/abi';

const ZKSYNC_EXPLORER_ADDRESSS_API = {
  testnet: 'https://zksync2-testnet-explorer.zksync.dev/address',
  mainnet: 'https://zksync2-mainnet-explorer.zksync.io/address',
} satisfies Partial<Record<ChainName, string>>;

// This is a subset of the response from the zkSync explorer API
// Example: https://zksync2-testnet-explorer.zksync.dev/address/0x578F0715c2E9DA8EFd4751Dd56fcaA7b2f00e04D
interface ZkSyncExplorerResp {
  verificationInfo?: {
    artifacts?: {
      abi: JsonFragment[];
    };
  };
}

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
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  findUnique = this.prisma.asUser.contract.findUnique;

  async findUniqueOrTryFetch<R extends Prisma.ContractArgs>(
    contract: Address,
    res?: Prisma.SelectSubset<R, Prisma.ContractArgs>,
  ) {
    return (
      (await this.prisma.asUser.contract.findUnique({ where: { id: contract }, ...res })) ??
      (await this.tryFetchAbi(contract, res))
    );
  }

  async addAccountAsVerified(account: Address) {
    // In the future this should verify the contract with the zkSync explorer as well
    await this.prisma.asUser.contract.create({
      data: {
        id: account,
        functions: {
          createMany: {
            data: Object.values(ACCOUNT_INTERFACE.functions).map((f) => ({
              selector: asSelector(ACCOUNT_INTERFACE.getSighash(f)),
              abi: JSON.parse(f.format('json')),
              source: AbiSource.VERIFIED,
            })),
          },
        },
      },
    });
  }

  async tryFetchAbi<R extends Prisma.ContractArgs>(
    contract: Address,
    res?: Prisma.SelectSubset<R, Prisma.ContractArgs>,
  ) {
    const resp = await this.queryZkSyncExplorer('testnet', contract);
    // (await this.tryFetchEtherscanAbi(contract)) ?? (await this.tryFetchDecompiledAbi(contract));
    if (!resp) return null;
    const [iface, source] = resp;

    return this.prisma.asUser.contract.upsert({
      where: { id: contract },
      create: {
        id: contract,
        functions: {
          createMany: {
            data: Object.values(iface.functions).map((func) => ({
              selector: asSelector(iface.getSighash(func)),
              abi: func.format('json'),
              source,
            })),
          },
        },
      },
      update: {},
      ...res,
    });
  }

  private async queryZkSyncExplorer(
    chain: keyof typeof ZKSYNC_EXPLORER_ADDRESSS_API,
    contract: Address,
  ) {
    const resp: ZkSyncExplorerResp | undefined = await fetchJsonWithRetry(
      `${ZKSYNC_EXPLORER_ADDRESSS_API[chain]}/${contract}`,
    );

    return resp?.verificationInfo?.artifacts?.abi
      ? ([Contract.getInterface(resp.verificationInfo.artifacts.abi), AbiSource.VERIFIED] as const)
      : undefined;
  }

  private async tryFetchEtherscanAbi(contract: Address) {
    const resp: EtherscanResp | undefined = await fetchJsonWithRetry(
      getEtherscanUrl(`module=contract&action=getabi&address=${contract}`),
    );

    return resp?.message === 'OK'
      ? ([Contract.getInterface(JSON.parse(resp.result)), AbiSource.VERIFIED] as const)
      : undefined;
  }

  private async tryFetchDecompiledAbi(contract: Address) {
    const resp = await fetchJsonWithRetry(`https://eveem.org/code/${contract}.json`);

    const iface =
      resp?.functions?.length &&
      Contract.getInterface(
        resp.functions.map((frag: { name: string }) => FunctionFragment.from(frag.name)),
      );

    return iface ? ([iface, AbiSource.DECOMPILED] as const) : undefined;
  }
}
