import { log } from '@graphprotocol/graph-ts';
import {
  WalletUpserted,
  WalletRemoved,
  TxExecuted,
  TxReverted,
} from '../generated/Account/Account';
import { Wallet, Tx } from '../generated/schema';
import { getAccountId, getTxId, getWalletId } from './id';
import { getOrCreateQuorum } from './quorum';
import { getOrCreateAccountWithoutImpl } from './util';

export function handleTxExecuted(e: TxExecuted): void {
  log.warning('Tx executed: {}\nAddr: {}\nHash: {}\n', [
    e.transaction.hash.toHex(),
    e.address.toHex(),
    e.params.txHash.toHex(),
  ]);

  const accountId = getAccountId(e.address);
  const tx = new Tx(getTxId(accountId, e.transaction));

  tx.account = accountId;
  tx.transactionHash = e.transaction.hash;
  tx.hash = e.params.txHash;
  tx.success = true;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleTxReverted(e: TxReverted): void {
  log.warning('Tx reverted: {}', [e.transaction.hash.toHex()]);

  const accountId = getAccountId(e.address);
  const tx = new Tx(getTxId(accountId, e.transaction));

  tx.account = accountId;
  tx.transactionHash = e.transaction.hash;
  tx.hash = e.params.txHash;
  tx.success = false;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleWalletUpserted(e: WalletUpserted): void {
  log.warning('handleWalletUpserted', []);

  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getWalletId(account.id, e.params.walletRef);
  let wallet = Wallet.load(id);
  if (!wallet) {
    wallet = new Wallet(id);
    wallet.account = account.id;
    wallet.ref = e.params.walletRef;
  }
  wallet.active = true;
  wallet.save();

  // const quorumIds = [];
  // for (let i = 0; i < e.params.quorums.length; i++) {
  //   quorumIds.push(getQuorumId(wallet.id, e.params.quorums[i]));
  // }

  // TODO: handle removing old quorums
  // Remove prior quorums
  // const existingQuorums = wallet.quorums;
  // for (let i = 0; i < wallet.quorums.length; ++i) {
  //   store.remove("Quorum", existingQuorums[i]);
  // }

  // Add quorums
  for (let i = 0; i < e.params.quorums.length; ++i) {
    const quorumBytes = e.params.quorums[i];
    getOrCreateQuorum(wallet, quorumBytes, e);
  }
}

export function handleWalletRemoved(e: WalletRemoved): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);
  const wallet = Wallet.load(getWalletId(account.id, e.params.walletRef));
  if (wallet) {
    wallet.active = false;
    wallet.save();
  }
}
