import { gql } from '@apollo/client';
import assert from 'assert';
import { Address, Policy } from 'lib';
import { useCallback } from 'react';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  PolicyFieldsFragmentDoc,
  useCreatePolicyMutation,
} from '@api/generated';
import { updateQuery } from '~/gql/util';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation CreatePolicy($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      ...PolicyFields
    }
  }
`;

export interface CreatePolicyOptions extends Omit<Policy, 'key'> {
  name: string;
}

export const useCreatePolicy = (account: Address) => {
  const [mutation] = useCreatePolicyMutation();

  return useCallback(
    async ({ name, approvers, threshold, permissions: p }: CreatePolicyOptions) => {
      const r = await mutation({
        variables: {
          input: {
            account,
            name,
            approvers: [...approvers],
            threshold,
            permissions: {
              targets: {
                contracts: Object.entries(p.targets.contracts).map(([contract, c]) => ({
                  contract: contract as Address,
                  functions: Object.entries(c.functions).map(([selector, allow]) => ({
                    selector,
                    allow,
                  })),
                  defaultAllow: c.defaultAllow,
                })),
                default: {
                  functions: Object.entries(p.targets.default.functions).map(
                    ([selector, allow]) => ({ selector, allow }),
                  ),
                  defaultAllow: p.targets.default.defaultAllow,
                },
              },
            },
          },
        },
        update: async (cache, res) => {
          const policy = res.data?.createPolicy;
          if (!policy) return;

          await updateQuery<AccountQuery, AccountQueryVariables>({
            query: AccountDocument,
            cache,
            variables: { input: { address: account } },
            updater: (data) => {
              assert(data.account);
              if (!data.account?.policies) data.account.policies = [];
              data.account.policies.push(policy);
            },
          });
        },
      });

      return r.data?.createPolicy;
    },
    [account, mutation],
  );
};
