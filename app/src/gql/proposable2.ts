import { ProposalId } from '~/queries/proposal';

// eslint-disable-next-line @typescript-eslint/ban-types
type Obj = {};

export type ProposableStatus = 'active' | 'modify' | 'add' | 'remove';

type ProposableState<T extends Obj = Obj> = ActiveState<T> | ProposedState<T>;

interface ActiveState<T extends Obj> {
  active: T;
  proposed?: T | null;
  proposal?: ProposalId;
}

interface ProposedState<T extends Obj> {
  active?: T;
  proposed: T;
  proposal?: ProposalId;
}

const isActive = <T extends Obj>(p: ProposableState<T>): p is ActiveState<T> =>
  p.active !== undefined;

const isProposed = <T extends Obj>(
  p: ProposableState<T>,
): p is ProposedState<T> => p.proposed !== undefined && p.proposed !== null;

export class Proposable2<
  T extends Obj,
  State extends ProposableState<T> = ProposableState<T>,
> {
  constructor(private state: State) {}

  isActive(): this is Proposable2<T, ActiveState<T>> {
    return this.active !== undefined;
  }
  isProposed(): this is Proposable2<T, ProposedState<T>> {
    return this.proposed !== undefined && this.proposed !== null;
  }

  status(): ProposableStatus {
    if (this.proposed === null) return 'remove';
    if (this.proposed === undefined) return 'active';
    return this.active ? 'modify' : 'add';
  }

  get value(): T {
    return isProposed(this.state) ? this.state.proposed : this.state.active;
  }

  set value(proposed: T | null) {
    if (this.active !== proposed && (proposed !== null || this.isActive())) {
      this.state.proposed = proposed;
    }
  }

  get active(): State['active'] {
    return this.state.active;
  }

  get proposed(): State['proposed'] {
    return this.state.proposed;
  }

  get proposal(): State['proposal'] {
    return this.state.proposal;
  }
}
