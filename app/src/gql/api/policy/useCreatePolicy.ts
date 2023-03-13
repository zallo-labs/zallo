import { gql } from '@apollo/client';
import assert from 'assert';
import { Address, ApprovalsRule, FunctionsRule, Policy, TargetsRule } from 'lib';
import { useCallback } from 'react';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  PolicyFieldsFragmentDoc,
  RulesInput,
  useCreatePolicyMutation,
} from '@api/generated';
import { updateQuery } from '~/gql/util';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation CreatePolicy($account: Address!, $name: String, $rules: RulesInput!) {
    createPolicy(account: $account, name: $name, rules: $rules) {
      ...PolicyFields
    }
  }
`;

export interface CreatePolicyOptions extends Policy {
  name: string;
}

export const useCreatePolicy = (account: Address) => {
  const [mutation] = useCreatePolicyMutation();

  return useCallback(
    async ({ name, rules }: CreatePolicyOptions) => {
      const r = await mutation({
        variables: {
          account,
          name,
          rules: asRulesInput(rules),
        },
        update: async (cache, res) => {
          const policy = res.data?.createPolicy;
          if (!policy) return;

          await updateQuery<AccountQuery, AccountQueryVariables>({
            query: AccountDocument,
            cache,
            variables: { id: account },
            updater: (data) => {
              assert(data.account);
              if (!data.account?.policies) data.account.policies = [];
              data.account.policies.push(policy);
            },
          });
        },
      });

      return r;
    },
    [account, mutation],
  );
};

export function asRulesInput(rules: Policy['rules']): RulesInput {
  return {
    approvers: [...(rules.get(ApprovalsRule)?.approvers ?? [])],
    onlyFunctions: [...(rules.get(FunctionsRule)?.functions ?? [])],
    onlyTargets: [...(rules.get(TargetsRule)?.targets ?? [])],
  };
}
