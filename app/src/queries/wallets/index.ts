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

export type ProposableState = 'added' | 'active' | 'removed';

export interface CombinedQuorum {
  approvers: Quorum;
  state: ProposableState;
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
  proposedModificationHash?: string;
}

export interface CombinedWallet extends WalletId {
  name: string;
  quorums: CombinedQuorum[];
  state: ProposableState;
}

export const toWallet = (
  w: Pick<CombinedWallet, 'ref' | 'quorums'>,
): Wallet => ({
  ref: w.ref,
  quorums: sortQuorums(w.quorums.map((q) => q.approvers)),
});

export const toActiveWallet = (
  w: Pick<CombinedWallet, 'ref' | 'quorums' | 'state'>,
): Wallet => {
  assert(w.state === 'active');

  return {
    ref: w.ref,
    quorums: sortQuorums(
      w.quorums.filter((q) => q.state === 'active').map((q) => q.approvers),
    ),
  };
};
