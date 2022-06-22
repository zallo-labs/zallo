import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Safe as SafeContract } from '../generated/Safe/Safe';
import { User, Group, Safe } from '../generated/schema';
import { getUserId, getSafeId } from './id';

export function getSafeContract(e: ethereum.Event): SafeContract {
  return SafeContract.bind(e.address);
}

export function getOrCreateSafe(addr: Address): Safe {
  const id = getSafeId(addr);
  let safe = Safe.load(id);
  if (!safe) {
    safe = new Safe(id);
    safe.save();
  }

  return safe;
}

export function getOrCreateGroup(id: string): Group {
  let group = Group.load(id);
  if (!group) group = new Group(id);

  return group;
}

export function getOrCreateUser(addr: Address): User {
  const id = getUserId(addr);
  let approver = User.load(id);
  if (!approver) {
    approver = new User(id);
    approver.save();
  }

  return approver;
}
