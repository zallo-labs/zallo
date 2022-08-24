import assert from 'assert';
import {
  WalletRef,
  Address,
  createIsObj,
  Id,
  Quorum,
  Wallet,
  sortQuorums,
  quorumToLeaf,
} from 'lib';

export const QUERY_WALLETS_POLL_INTERVAL = 30 * 1000;

export type ProposableState = 'active' | 'add' | 'remove';

export interface CombinedQuorum {
  approvers: Quorum;
  state: ProposableState;
  proposedModificationHash?: string;
}

export const isCombinedQuorum = createIsObj<CombinedQuorum>(
  'approvers',
  'state',
);

export const sortCombinedQuorums = (
  quorums: CombinedQuorum[],
): CombinedQuorum[] =>
  quorums
    .map((q) => ({ q, leaf: quorumToLeaf(q.approvers) }))
    .sort((a, b) => Buffer.compare(a.leaf, b.leaf))
    .map(({ q }) => q);

export interface WalletId {
  id: Id;
  accountAddr: Address;
  ref: WalletRef;
}

export interface CombinedWallet extends WalletId {
  name: string;
  quorums: CombinedQuorum[];
  state: ProposableState;
  proposedModificationHash?: string;
}

export const toSafeWallet = (
  w: Pick<CombinedWallet, 'ref' | 'quorums'>,
): Wallet => ({
  ref: w.ref,
  quorums: sortQuorums(
    w.quorums.filter((q) => q.state !== 'remove').map((q) => q.approvers),
  ),
});

export const toActiveWallet = (
  w: Pick<CombinedWallet, 'ref' | 'quorums' | 'state'>,
): Wallet => {
  assert(w.state === 'active');

  return {
    ref: w.ref,
    quorums: sortQuorums(
      w.quorums.filter((q) => q.state !== 'add').map((q) => q.approvers),
    ),
  };
};
