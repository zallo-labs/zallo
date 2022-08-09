import {
  WalletUpserted,
  WalletRemoved,
  TxExecuted,
  TxReverted,
} from '../generated/Account/Account';
import { Wallet, Tx } from '../generated/schema';
import { getAccountId, getTxId, getWalletId } from './id';
import { getOrCreateQuorum } from './quorum';
import { getOrCreateWallet, getOrCreateAccount } from './util';

export function handleTxExecuted(e: TxExecuted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.account = getAccountId(e.address);
  tx.hash = e.params.txHash;
  tx.success = true;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleTxReverted(e: TxReverted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.account = getAccountId(e.address);
  tx.hash = e.params.txHash;
  tx.success = false;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleWalletUpserted(e: WalletUpserted): void {
  const account = getOrCreateAccount(e.address);

  const wallet = getOrCreateWallet(getWalletId(account.id, e.params.walletRef));
  wallet.account = account.id;
  wallet.ref = e.params.walletRef;
  wallet.active = true;
  wallet.save();

  // Add quorums
  for (let i = 0; i < e.params.quorums.length; ++i) {
    const quorumBytes = e.params.quorums[i];
    getOrCreateQuorum(wallet, quorumBytes, e);
  }
}

export function handleWalletRemoved(e: WalletRemoved): void {
  const account = getOrCreateAccount(e.address);
  const wallet = Wallet.load(getWalletId(account.id, e.params.walletRef));
  if (wallet) {
    wallet.active = false;
    wallet.save();
  }
}
