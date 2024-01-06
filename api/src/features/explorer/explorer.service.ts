import { Injectable } from '@nestjs/common';
import { BigNumberish, Contract } from 'ethers';

import { Address, Hex } from 'lib';
import { fetchJsonWithRetry } from '~/util/fetch';

@Injectable()
export class ExplorerService {
  async transaction(transactionHash: Hex): Promise<TransactionData | undefined> {
    // https://zksync2-testnet-explorer.zksync.dev/transaction/0x71c873a22ca9a1d05f06cb1dbb6bb73d0ff5be0cce67ed04a5ae8f0fa87e787f
    return this.query<TransactionData>(`/transaction/${transactionHash}`);
  }

  private async query<T = any>(url: string): Promise<T | undefined> {
    if (!url.startsWith('/')) url = `/${url}`;

    return fetchJsonWithRetry(`${ZKSYNC_EXPLORER_ADDRESSS_API['testnet']}${url}`);
  }
}

const ZKSYNC_EXPLORER_ADDRESSS_API = {
  testnet: 'https://zksync2-testnet-explorer.zksync.dev',
  mainnet: 'https://zksync2-mainnet-explorer.zksync.io',
};

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
