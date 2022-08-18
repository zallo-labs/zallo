import { Address, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts';
import { Wallet, Quorum, QuorumApprover } from '../generated/schema';
import { getOrCreateUser } from './util';

export function getQuorumId(walletId: string, quorumHash: Bytes): string {
  // {wallet.id}-{hash}
  return `${walletId}-${quorumHash.toHex()}`;
}

export function getOrCreateQuorum(
  wallet: Wallet,
  quorumBytes: Bytes,
  event: ethereum.Event,
): Quorum {
  const hash = Bytes.fromByteArray(crypto.keccak256(quorumBytes));
  const id = getQuorumId(wallet.id, hash);

  let quorum = Quorum.load(id);
  if (!quorum) {
    quorum = new Quorum(id);
    quorum.hash = hash;
    quorum.wallet = wallet.id;
    quorum.active = true;
    quorum.blockHash = event.block.hash;
    quorum.timestamp = event.block.timestamp;
    quorum.save();

    createQuorumApprovers(id, quorumBytes);
  }

  return quorum;
}

function getQuorumApproverId(quorumId: string, approverId: Bytes): string {
  // "{quorum.id}-{approver.id}"
  return `${quorumId}-${approverId.toHex()}`;
}

function createQuorumApprovers(quorumId: string, quorumBytes: Bytes): string[] {
  const value = ethereum.decode('address[]', quorumBytes);
  if (!value) throw new Error('Failed to decode quorum');

  const approvers = value.toAddressArray();
  const ids: string[] = [];
  for (let i = 0; i < approvers.length; ++i) {
    const user = getOrCreateUser(approvers[i]);
    const qaId = getQuorumApproverId(quorumId, user.id);

    let qa = QuorumApprover.load(qaId);
    if (!qa) {
      qa = new QuorumApprover(qaId);
      qa.quorum = quorumId;
      qa.approver = user.id;
      qa.save();
    }

    ids.push(qa.id);
  }

  return ids;
}
