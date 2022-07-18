import { Bytes } from '@graphprotocol/graph-ts';
import {
  GroupUpserted,
  GroupRemoved,
  TxExecuted,
  TxReverted,
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
import { getOrCreateUser, getOrCreateGroup, getOrCreateSafe } from './util';

// zkSync ETH token
const ETH_TOKEN: Bytes = Bytes.fromHexString(
  '0x000000000000000000000000000000000000800a',
);

export function handleReceived(e: Received): void {
  const transfer = new Transfer(getTransferId(e));

  transfer.safe = getOrCreateSafe(e.address).id;
  transfer.tx = getTxId(e.transaction);
  transfer.txHash = e.transaction.hash;
  transfer.token = ETH_TOKEN;
  transfer.type = 'IN';
  transfer.from = e.params.from;
  transfer.to = e.address;
  transfer.value = e.params.value;
  transfer.blockHash = e.block.hash;
  transfer.timestamp = e.block.timestamp;

  transfer.save();
}

export function handleTxExecuted(e: TxExecuted): void {
  const tx = new Tx(getTxId(e.transaction));

  tx.safe = getSafeId(e.address);
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

  tx.safe = getSafeId(e.address);
  tx.hash = e.params.txHash;
  tx.success = false;
  tx.response = e.params.response;
  tx.executor = e.transaction.from;
  tx.blockHash = e.block.hash;
  tx.timestamp = e.block.timestamp;

  tx.save();
}

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
