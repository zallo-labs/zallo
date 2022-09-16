import { Bytes, ethereum } from '@graphprotocol/graph-ts';
import { TxExecuted, TxReverted } from '../generated/Account/Account';
import { Tx } from '../generated/schema';
import { getAccountId } from './account';

export function handleTxExecuted(e: TxExecuted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.account = getAccountId(e.address);
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
  const tx = new Tx(getTxId(e.transaction));

  tx.account = getAccountId(e.address);
  tx.transactionHash = e.transaction.hash;
  tx.hash = e.params.txHash;
  tx.success = false;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function getTxId(transaction: ethereum.Transaction): Bytes {
  // {transaction.hash}
  return transaction.hash;
}
