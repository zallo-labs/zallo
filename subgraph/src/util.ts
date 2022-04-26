import { Address, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts';
import { GroupAddedApproversStruct, Safe } from '../generated/Safe/Safe';
import { Approver, Safe as SafeObj } from '../generated/schema';
import { getApproverId, getSafeObjId } from './id';

export function getSafe(e: ethereum.Event): Safe {
  return Safe.bind(e.address);
}

function approverToEthValue(
  approver: GroupAddedApproversStruct,
): ethereum.Tuple {
  const addr = ethereum.Value.fromAddress(approver.addr);
  const weight = ethereum.Value.fromUnsignedBigInt(approver.weight);

  return changetype<ethereum.Tuple>([addr, weight]);
}

export function hashGroup(approvers: GroupAddedApproversStruct[]): Bytes {
  const appTuples: ethereum.Tuple[] = [];
  for (let i = 0; i < approvers.length; i++) {
    appTuples.push(approverToEthValue(approvers[i]));
  }

  const encoded = ethereum.encode(ethereum.Value.fromTupleArray(appTuples));
  if (!encoded) throw new Error('Failed to hash group');

  return Bytes.fromByteArray(crypto.keccak256(encoded));
}

export function getOrCreateSafeObj(addr: Address): SafeObj {
  const id = getSafeObjId(addr);
  let safeObj = SafeObj.load(id);
  if (!safeObj) {
    safeObj = new SafeObj(id);
    safeObj.save();
  }

  return safeObj;
}

export function getOrCreateApprover(addr: Address): Approver {
  const id = getApproverId(addr);
  let approver = Approver.load(id);
  if (!approver) {
    approver = new Approver(id);
    approver.save();
  }

  return approver;
}
