import { Bytes } from '@graphprotocol/graph-ts';
import {
  Deposit as DepositEvent,
  GroupAdded,
  GroupRemoved,
  MultiTransaction,
  Transaction,
} from '../generated/Safe/Safe';
import { Group, GroupApprover, TokenTransfer, Tx } from '../generated/schema';
import {
  getGroupApproverId,
  getGroupId,
  getSafeObjId,
  getTokenTransferId,
  getTxId,
} from './id';
import {
  getOrCreateApprover,
  getOrCreateSafeObj,
  getSafe,
  hashGroup,
} from './util';

export function handleGroupAdded(e: GroupAdded): void {
  const safe = getSafe(e);
  const hash = hashGroup(e.params.approvers);
  const id = getGroupId(safe._address, hash);

  const group = new Group(id);
  group.safe = getOrCreateSafeObj(safe._address).id;
  group.hash = hash;
  group.active = true;

  group.save();

  // Create GroupApprovers & maybe Approver
  for (let i = 0; i < e.params.approvers.length; i++) {
    const approverStruct = e.params.approvers[i];
    const approverId = getOrCreateApprover(approverStruct.addr).id;

    const groupApprover = new GroupApprover(getGroupApproverId(id, approverId));
    groupApprover.group = id;
    groupApprover.approver = approverId;
    groupApprover.weight = approverStruct.weight;

    groupApprover.save();
  }
}

export function handleGroupRemoved(e: GroupRemoved): void {
  const group = Group.load(getGroupId(e.address, e.params.groupHash));
  if (group) {
    group.active = false;
    group.save();
  }
}

// zkSync ETH token
const ETH_TOKEN: Bytes = Bytes.fromHexString(
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
);

export function handleDeposit(e: DepositEvent): void {
  const transfer = new TokenTransfer(getTokenTransferId(e));

  transfer.safe = getSafeObjId(e.address);
  transfer.token = ETH_TOKEN;
  transfer.type = 'IN';
  transfer.from = e.params.from;
  transfer.to = e.address;
  transfer.value = e.params.value;
  transfer.blockHash = e.block.hash;
  transfer.timestamp = e.block.timestamp;

  transfer.save();
}

export function handleTransaction(e: Transaction): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeObjId(getSafe(e)._address);
  tx.type = 'SINGLE';
  tx.hash = e.params.txHash;
  tx.responses = [e.params.response];
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleMultiTransaction(e: MultiTransaction): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeObjId(getSafe(e)._address);
  tx.type = 'MULTI';
  tx.hash = e.params.txHash;
  tx.responses = e.params.responses;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}
