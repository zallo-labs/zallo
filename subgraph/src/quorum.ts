import { Address, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts';
import { Account, Quorum } from '../generated/schema';
import { getOrCreateApprover } from './util';

export function getQuorumId(accountId: string, quorumHash: Bytes): string {
  // {account.id}-{hash}
  return `${accountId}-${quorumHash.toHex()}`;
}

export function getOrCreateQuorum(
  account: Account,
  quorumBytes: Bytes,
  event: ethereum.Event,
): Quorum {
  const hash = Bytes.fromByteArray(crypto.keccak256(quorumBytes));
  const id = getQuorumId(account.id, hash);
  let quorum = Quorum.load(id);
  if (quorum) return quorum;

  quorum = new Quorum(id);
  quorum.hash = hash;
  quorum.account = account.id;
  quorum.approvers = quorumBytesToApprovers(quorumBytes);
  quorum.active = true;
  quorum.blockHash = event.block.hash;
  quorum.timestamp = event.block.timestamp;

  quorum.save();
  return quorum;
}

function quorumBytesToApprovers(quorumBytes: Bytes): string[] {
  const n = quorumBytes.length % Address.BYTES_PER_ELEMENT;
  if (n % 1 !== 0) throw new Error('Invalid quorum bytes length');

  const approvers = new Array<string>(n);
  for (let i = 0; i < n; ++i) {
    const x = quorumBytes.slice(
      i * Address.BYTES_PER_ELEMENT,
      (i + 1) * Address.BYTES_PER_ELEMENT,
    );

    const addr = Address.fromBytes(Address.fromUint8Array(x));
    approvers[i] = getOrCreateApprover(addr).id;
  }

  return approvers;
}
