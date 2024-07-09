import { PrimitiveAtom } from 'jotai';
import { useImmerAtom } from 'jotai-immer';
import { Address, PolicyKey, TransfersConfig, UAddress } from 'lib';
import { createContext, useContext } from 'react';
import { graphql, readInlineData } from 'relay-runtime';
import {
  policyAsDraft_policy$data,
  policyAsDraft_policy$key,
} from '~/api/__generated__/policyAsDraft_policy.graphql';
import { PolicyInput } from '~/api/__generated__/useCreateAccountMutation.graphql';

export type PolicyDraftAction = Omit<
  policyAsDraft_policy$data['actions'][0],
  'id' | 'functions'
> & { functions: Omit<policyAsDraft_policy$data['actions'][0]['functions'][0], 'id'>[] };

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

const Policy = graphql`
  fragment policyAsDraft_policy on Policy @inline {
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
`;

export function policyAsDraft(
  policyKey: policyAsDraft_policy$key,
): Pick<
  PolicyDraft,
  'approvers' | 'threshold' | 'actions' | 'transfers' | 'allowMessages' | 'delay'
> {
  const s = readInlineData(Policy, policyKey);

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
        amount: limit.amount.toString(),
        duration: limit.duration,
      })),
      budget: p.transfers.budget,
      defaultAllow: p.transfers.defaultAllow,
    },
    allowMessages: p.allowMessages,
    delay: p.delay,
  };
}
