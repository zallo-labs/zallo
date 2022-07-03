import { Bytes } from '@graphprotocol/graph-ts';
import {
  GroupUpserted,
  GroupRemoved,
  Transaction,
  MultiTransaction,
  TransactionReverted,
  Received,
} from '../generated/Safe/Safe';
import {
  Approver,
  ApproverSet,
  Group,
  Transfer,
  Tx,
} from '../generated/schema';
import {
  getApproverId,
  getApproverSetId,
  getGroupId,
  getSafeId,
  getTransferId,
  getTxId,
} from './id';
import {
  getOrCreateUser,
  getOrCreateGroup,
  getOrCreateSafe,
  getSafeContract,
} from './util';

export function handleGroupUpserted(e: GroupUpserted): void {
  const safe = getOrCreateSafe(e.address);

  const group = getOrCreateGroup(getGroupId(safe.id, e.params.groupRef));
  group.safe = safe.id;
  group.ref = e.params.groupRef;
  group.active = true;
  group.save();

  // Add an approvers set
  const set = new ApproverSet(getApproverSetId(group.id, e.block.hash));
  set.group = group.id;
  set.blockHash = e.block.hash;
  set.timestamp = e.block.timestamp;
  set.save();

  for (let i = 0; i < e.params.approvers.length; i++) {
    const a = e.params.approvers[i];
    const user = getOrCreateUser(a.addr);

    const approver = new Approver(getApproverId(set.id, user.id));
    approver.user = user.id;
    approver.approverSet = set.id;
    approver.weight = a.weight;
    approver.save();
  }
}

export function handleGroupRemoved(e: GroupRemoved): void {
  const safe = getOrCreateSafe(e.address);
  const group = Group.load(getGroupId(safe.id, e.params.groupRef));
  if (group) {
    group.active = false;
    group.save();
  }
}

// zkSync ETH token
const ETH_TOKEN: Bytes = Bytes.fromHexString(
  '0x000000000000000000000000000000000000800a',
);

export function handleReceive(e: Received): void {
  const transfer = new Transfer(getTransferId(e));

  transfer.safe = getSafeId(e.address);
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

  tx.safe = getSafeId(getSafeContract(e)._address);
  tx.hash = e.params.txHash;
  tx.reverted = false;
  tx.responses = [e.params.response];
  tx.nResponses = tx.responses.length;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleMultiTransaction(e: MultiTransaction): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeId(getSafeContract(e)._address);
  tx.hash = e.params.txHash;
  tx.reverted = false;
  tx.responses = e.params.responses;
  tx.nResponses = tx.responses.length;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

export function handleTransactionReverted(e: TransactionReverted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeId(getSafeContract(e)._address);
  tx.hash = e.params.txHash;
  tx.reverted = true;
  tx.responses = [e.params.response];
  tx.nResponses = tx.responses.length;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}
