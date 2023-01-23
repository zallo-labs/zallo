import assert from 'assert';
import { BigNumber } from 'ethers';
import {
  address,
  Address,
  Quorum,
  QuorumGuid,
  QuorumKey,
  TokenLimit,
  TokenLimitPeriod,
  toQuorumKey,
} from 'lib';
import { QuorumFieldsFragment, QuorumStateFieldsFragment } from '~/gql/generated.api';
import { ProposalId } from '../proposal';

export type Proposable<T extends object> = T & {
  proposal?: ProposalId;
};

export interface Removal {
  removal: true;
}

export const isRemoval = <T extends object>(value: T | Removal): value is Removal =>
  'removal' in value && value['removal'] === true;

const stateFromFragment = (
  id: QuorumGuid,
  state: QuorumStateFieldsFragment,
): Proposable<Quorum> => ({
  key: id.key,
  proposal: state.proposalId ? { id: state.proposalId } : undefined,
  approvers: new Set(state.approvers?.map((a) => address(a.userId))),
  spending: {
    fallback: state.spendingFallback,
    limits: Object.fromEntries(
      state.limits?.map((l): [Address, TokenLimit] => [
        address(l.token),
        {
          token: address(l.token),
          amount: BigNumber.from(l.amount),
          period: l.period as TokenLimitPeriod,
        },
      ]) ?? [],
    ),
  },
});

const removableStateFromFragment = (
  id: QuorumGuid,
  state: QuorumStateFieldsFragment,
): Proposable<Quorum | Removal> =>
  state.isRemoved
    ? { removal: true, proposal: state.proposalId ? { id: state.proposalId } : undefined }
    : stateFromFragment(id, state);

/*
 * Proposable can only exist in 2 states:
 * Active:
 *    active: T
 *    proposals: (T | null)[*]
 * Proposed:
 *    active: undefined
 *    proposals: T[+]
 */
export class CombinedQuorum<Active extends boolean = false> implements QuorumGuid {
  constructor(
    public account: Address,
    public key: QuorumKey,
    public name: string,
    public active: Active extends true ? Proposable<Quorum> : Proposable<Quorum> | undefined,
    public proposals: Proposable<Quorum | Removal>[],
  ) {}

  static fromFragment(q: QuorumFieldsFragment) {
    const id: QuorumGuid = {
      account: address(q.accountId),
      key: toQuorumKey(q.key),
    };

    return new CombinedQuorum(
      id.account,
      id.key,
      q.name,
      q.activeState ? stateFromFragment(id, q.activeState) : undefined,
      q.proposedStates.map((s) => removableStateFromFragment(id, s)),
    );
  }

  get activeOrLatest(): Proposable<Quorum> {
    return this.active || (this.proposals[this.proposals.length - 1] as Proposable<Quorum>);
  }

  isActive(): this is CombinedQuorum<true> {
    return !!this.active;
  }

  propose(value: Active extends true ? Quorum | null : Quorum) {
    if (value) {
      assert(value.key === this.key);
    } else {
      assert(this.active);
    }

    this.proposals.push(value !== null ? value : { removal: true });
  }
}
