import { Bytes, ethereum } from '@graphprotocol/graph-ts';
import { TransactionExecuted, TransactionReverted } from '../generated/Account/Account';
import { Transaction } from '../generated/schema';
import { getAccountId } from './account';

export function handleTransactionExecuted(e: TransactionExecuted): void {
  const tx = new Transaction(getTransactionId(e.transaction));

  tx.account = getAccountId(e.address);
  tx.transactionHash = e.transaction.hash;
  tx.proposalId = e.params.txHash;
  tx.success = true;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleTransactionReverted(e: TransactionReverted): void {
  const tx = new Transaction(getTransactionId(e.transaction));

  tx.account = getAccountId(e.address);
  tx.transactionHash = e.transaction.hash;
  tx.proposalId = e.params.txHash;
  tx.success = false;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function getTransactionId(transaction: ethereum.Transaction): Bytes {
  // {transaction.hash}
  return transaction.hash;
}
