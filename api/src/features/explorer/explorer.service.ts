import { Injectable } from '@nestjs/common';
import { BigNumber, BigNumberish } from 'ethers';
import { Address, ChainName, Hex, asAddress } from 'lib';
import { fetchJsonWithRetry } from '~/util/fetch';

@Injectable()
export class ExplorerService {
  async transactionTransfers(transactionHash: Hex): Promise<ExplorerTransfer[]> {
    // https://zksync2-testnet-explorer.zksync.dev/transaction/0x71c873a22ca9a1d05f06cb1dbb6bb73d0ff5be0cce67ed04a5ae8f0fa87e787f
    const tx = await this.query<TransactionData>(`/transaction/${transactionHash}`);
    if (!tx) return [];

    return toTransfers(tx);
  }

  async accountTransfers({
    account,
    limit = 100,
    direction = 'newer',
  }: AccountTransfersArgs): Promise<ExplorerTransfer[]> {
    if (limit < 0 || limit > 100) throw new Error('limit must be [0, 100]');

    // https://zksync2-testnet-explorer.zksync.dev/transactions?limit=10&direction=older&accountAddress=0x6BfA67e65e4735DCc9Ff6036D09F680f35740A83
    const txs = await this.query<TransactionsData>(
      `/transaction?accountAddress=${account}&limit=${limit}&direction=${direction}`,
    );
    if (!txs) return [];

    return txs.list.flatMap(toTransfers);
  }

  private async query<T = any>(url: string): Promise<T | undefined> {
    if (!url.startsWith('/')) url = `/${url}`;

    return fetchJsonWithRetry(`${ZKSYNC_EXPLORER_ADDRESSS_API['testnet']}${url}`);
  }
}

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

export interface ExplorerTransfer {
  token: Address;
  from: Address;
  to: Address;
  amount: bigint;
}

const toTransfers = (tx: TransactionData): ExplorerTransfer[] =>
  tx.erc20Transfers.map((t) => ({
    token: asAddress(t.tokenInfo.l2Address),
    from: asAddress(t.from),
    to: asAddress(t.to),
    amount: BigNumber.from(t.amount).toBigInt(),
  }));

const ZKSYNC_EXPLORER_ADDRESSS_API = {
  testnet: 'https://zksync2-testnet-explorer.zksync.dev',
  mainnet: 'https://zksync2-mainnet-explorer.zksync.io',
} satisfies Partial<Record<ChainName, string>>;

interface AccountTransfersArgs {
  account: Address;
  limit?: number;
  direction?: 'older' | 'newer';
}
