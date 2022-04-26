import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  ExecutionTxStruct,
  Safe,
  Safe__hashTxInput_txStruct,
} from '../generated/Safe/Safe';

export function getSafeObjId(safe: Address): string {
  // {address}
  return safe.toHex();
}

export function getApproverId(approver: Address): string {
  // {address}
  return approver.toHex();
}

export function getGroupId(safe: Address, hash: Bytes): string {
  // {safe.id}-{hash}
  return `${safe.toHex()}-${hash.toHex()}`;
}

export function getGroupApproverId(
  groupId: string,
  approverId: string,
): string {
  // {group.id}-{approver.id}
  return `${groupId}-${approverId}`;
}

export function getDepositId(e: ethereum.Event): string {
  // {tx.hash}-{tx.log.index}
  return `${e.transaction.hash.toHex()}-${e.transactionLogIndex}`;
}

export function getTransactionId(safe: Safe, tx: ExecutionTxStruct): string {
  // {EIP712_hash(txData)}
  return safe.hashTx(changetype<Safe__hashTxInput_txStruct>(tx)).toHex();
}

export function getTransactionApproverId(
  txId: string,
  approverId: string,
): string {
  // {transaction.id}-{approver.id}
  return `${txId}-${approverId}`;
}
