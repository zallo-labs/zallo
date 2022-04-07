import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Safe } from '../generated/Safe/Safe';

export function getSafe(e: ethereum.Event): Safe {
  return Safe.bind(e.address);
}

export function getSafeObjId(safe: Address): string {
  return safe.toHex();
}

export function getApproverId(approver: Address): string {
  return approver.toHex();
}

export function getTxApproverId(txId: string, approverId: string): string {
  return `${txId}-${approverId}`;
}
