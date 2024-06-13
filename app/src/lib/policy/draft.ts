import { FragmentType, gql, useFragment as getFragment } from '@api';
import { PolicyAsDraft_PolicyFragment, PolicyInput } from '@api/generated/graphql';
import { PrimitiveAtom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';
import { Address, PolicyKey, TransfersConfig, UAddress } from 'lib';
import { createContext, useContext } from 'react';

export type PolicyDraftAction = Omit<
  PolicyAsDraft_PolicyFragment['actions'][0],
  'id' | 'functions'
> & { functions: Omit<PolicyAsDraft_PolicyFragment['actions'][0]['functions'][0], 'id'>[] };

export interface PolicyDraft {
  account: UAddress;
  key?: PolicyKey;
  name: string;
  approvers: Set<Address>;
  threshold: number;
  actions: PolicyDraftAction[];
  transfers: TransfersConfig;
  allowMessages: boolean;
  delay: number;
}

export type PolicyView = 'state' | 'draft';

export const PolicyDraftContext = createContext<PrimitiveAtom<PolicyDraft> | null>(null);
export const usePolicyDraftAtom = () => useContext(PolicyDraftContext)!;
export const usePolicyDraft = () => useImmerAtom(usePolicyDraftAtom());

const PolicyState = gql(/* GraphQL */ `
  fragment policyAsDraft_Policy on Policy {
    id
    approvers {
      id
      address
    }
    threshold
    actions {
      id
      label
      functions {
        id
        contract
        selector
        abi
      }
      allow
      description
    }
    transfers {
      id
      limits {
        id
        token
        amount
        duration
      }
      defaultAllow
      budget
    }
    allowMessages
    delay
  }
`);

export function policyAsDraft(
  stateFragment: FragmentType<typeof PolicyState>,
):
  | Pick<
      PolicyDraft,
      'approvers' | 'threshold' | 'actions' | 'transfers' | 'allowMessages' | 'delay'
    >
  | undefined {
  const s = getFragment(PolicyState, stateFragment);

  return {
    approvers: new Set(s.approvers.map((a) => a.address)),
    threshold: s.threshold,
    actions: s.actions.map(({ id: _, ...a }) => ({
      ...a,
      functions: a.functions.map(({ id: _, ...f }) => f),
    })),
    transfers: {
      limits: Object.fromEntries(
        s.transfers.limits.map((l) => [
          l.token,
          {
            amount: BigInt(l.amount),
            duration: l.duration,
          },
        ]),
      ),
      defaultAllow: s.transfers.defaultAllow,
      budget: s.transfers.budget,
    },
    allowMessages: s.allowMessages,
    delay: s.delay,
  };
}

export function asPolicyInput(p: Omit<PolicyDraft, 'account'>): PolicyInput {
  return {
    key: p.key,
    name: p.name,
    approvers: [...p.approvers],
    threshold: p.threshold,
    actions: p.actions,
    transfers: {
      limits: Object.entries(p.transfers.limits).map(([token, limit]) => ({
        token: token as Address,
        amount: limit.amount,
        duration: limit.duration,
      })),
      budget: p.transfers.budget,
      defaultAllow: p.transfers.defaultAllow,
    },
    allowMessages: p.allowMessages,
    delay: p.delay,
  };
}
