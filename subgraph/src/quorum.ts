import { BigInt, store } from '@graphprotocol/graph-ts';
import { QuorumRemoved, QuorumUpserted } from '../generated/Account/Account';
import { Account, Quorum } from '../generated/schema';
import { getOrCreateAccountWithoutImpl } from './account';

export function handleQuorumUpserted(e: QuorumUpserted): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getQuorumId(account, e.params.key);
  let quorum = Quorum.load(id);
  if (!quorum) {
    quorum = new Quorum(id);
    quorum.account = account.id;
    quorum.key = e.params.key;
  }

  quorum.hash = e.params.quorumHash;

  quorum.save();
}

export function handleQuorumRemoved(e: QuorumRemoved): void {
  const account = getOrCreateAccountWithoutImpl(e.address, e.block);

  const id = getQuorumId(account, e.params.key);
  if (Quorum.load(id)) store.remove('Quorum', id);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function getQuorumId(account: Account, key: BigInt): string {
  // {account.id}-{key}
  return `${account.id.toHex()}-${key}`;
}
