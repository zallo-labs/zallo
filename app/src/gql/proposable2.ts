import { ProposalId } from '~/queries/proposal';

type Proposable<T> = Proposed<T> | Active<T>;

export type ProposableStatus = 'active' | 'modify' | 'add' | 'remove';

export interface ProposedValue<T> {
  value: T | null;
  proposal?: ProposalId;
}

export class Proposed<T> {
  constructor(public proposals: ProposedValue<T>[]) {}

  get latestProposal(): ProposedValue<T> {
    return this.proposals[this.proposals.length - 1];
  }

  get latestValue(): T | null {
    return this.latestProposal.value;
  }
}

export class Active<T> extends Proposed<T> {
  constructor(public active: ProposedValue<T>, proposals: ProposedValue<T>[]) {
    super(proposals);
  }

  override get latestValue(): T | null {
    return this.active.value;
  }
}

// export type ProposableStatus = 'active' | 'modify' | 'add' | 'remove';

export class Proposable2<T> {
  constructor(public active: ProposedValue<T> | undefined, public proposals: ProposedValue<T>[]) {}

  get latestProposal(): ProposedValue<T> | undefined {
    return this.proposals[this.proposals.length - 1];
  }

  get activeOrLatest(): T | null {
    return this.active?.value ?? this.latestProposal!.value;
  }

  propose(value: T | null) {
    this.proposals.push({ value });
  }
}
