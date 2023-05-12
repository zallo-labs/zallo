import { Injectable } from '@nestjs/common';
import { BigNumberish, Contract } from 'ethers';
import { Address, Addresslike, ChainName, Hex, asAddress } from 'lib';
import { fetchJsonWithRetry } from '~/util/fetch';
import { JsonFragment } from '@ethersproject/abi';
import { AbiSource } from '../contract-functions/contract-functions.model';

@Injectable()
export class ExplorerService {
  async transaction(transactionHash: Hex): Promise<TransactionData | undefined> {
    // https://zksync2-testnet-explorer.zksync.dev/transaction/0x71c873a22ca9a1d05f06cb1dbb6bb73d0ff5be0cce67ed04a5ae8f0fa87e787f
    return this.query<TransactionData>(`/transaction/${transactionHash}`);
  }

  async tokenInfo(token: Address) {
    // https://zksync2-testnet-explorer.zksync.dev/token/0x0faF6df7054946141266420b43783387A78d82A9
    const info = await this.query<TokenInfo>(`/token/${token}`);

    return info
      ? {
          ...info,
          l1Address: asAddress(info.l1Address),
          l2Address: asAddress(info.l2Address),
        }
      : undefined;
  }

  async verifiedContract(contract: Address) {
    // https://zksync2-testnet-explorer.zksync.dev/api/contract/0x0faF6df7054946141266420b43783387A78d82A9
    const resp = await this.query<VerificationResponse>(`/address/${contract}`);

    return resp?.verificationInfo?.artifacts?.abi
      ? ([Contract.getInterface(resp.verificationInfo.artifacts.abi), AbiSource.Verified] as const)
      : undefined;
  }

  private async query<T = any>(url: string): Promise<T | undefined> {
    if (!url.startsWith('/')) url = `/${url}`;

    return fetchJsonWithRetry(`${ZKSYNC_EXPLORER_ADDRESSS_API['testnet']}${url}`);
  }
}

const ZKSYNC_EXPLORER_ADDRESSS_API = {
  testnet: 'https://zksync2-testnet-explorer.zksync.dev',
  mainnet: 'https://zksync2-mainnet-explorer.zksync.io',
} satisfies Partial<Record<ChainName, string>>;

interface TransactionData {
  transactionHash: Hex;
  receivedAt: string; // ISO
  status: 'pending' | 'included' | 'verified';
  fee: BigNumberish;
  erc20Transfers: {
    tokenInfo: {
      l2Address: Address;
    };
    from: Address;
    to: Address;
    amount: BigNumberish;
  }[];
}

interface TokenInfo {
  l1Address: Addresslike;
  l2Address: Addresslike;
  symbol: string;
  name: string;
  decimals: number;
}

interface VerificationResponse {
  verificationInfo?: {
    artifacts?: {
      abi: JsonFragment[];
    };
  };
}
