import { Injectable } from '@nestjs/common';
import { BigNumber, BigNumberish } from 'ethers';
import { Address, Addresslike, ChainName, Hex, asAddress } from 'lib';
import { fetchJsonWithRetry } from '~/util/fetch';
import { ExplorerTransfer } from './explorer.model';

@Injectable()
export class ExplorerService {
  async transaction(transactionHash: Hex): Promise<TransactionData | undefined> {
    // https://zksync2-testnet-explorer.zksync.dev/transaction/0x71c873a22ca9a1d05f06cb1dbb6bb73d0ff5be0cce67ed04a5ae8f0fa87e787f
    return this.query<TransactionData>(`/transaction/${transactionHash}`);
  }

  async accountTransfers({
    account,
    limit,
    direction = 'newer',
  }: AccountTransfersArgs): Promise<ExplorerTransfer[]> {
    if (limit < 0 || limit > 100) throw new Error('limit must be [0, 100]');

    // https://zksync2-testnet-explorer.zksync.dev/transactions?limit=10&direction=older&accountAddress=0x6BfA67e65e4735DCc9Ff6036D09F680f35740A83
    const txs = await this.query<TransactionsData>(
      `/transactions?accountAddress=${account}&limit=${limit}&direction=${direction}`,
    );
    if (!txs) return [];

    return txs.list.flatMap((tx) =>
      tx.erc20Transfers.map((t, i) => ({
        id: `${tx.transactionHash}-${i}`,
        transferNumber: i,
        token: asAddress(t.tokenInfo.l2Address),
        from: asAddress(t.from),
        to: asAddress(t.to),
        amount: BigNumber.from(t.amount).toBigInt(),
        timestamp: new Date(tx.receivedAt),
      })),
    );
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
  status: 'included' | 'verified';
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

interface TransactionsData {
  list: TransactionData[];
  total: number;
}

interface AccountTransfersArgs {
  account: Address;
  limit: number;
  direction?: 'older' | 'newer';
}

interface TokenInfo {
  l1Address: Addresslike;
  l2Address: Addresslike;
  symbol: string;
  name: string;
  decimals: number;
}
