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
    async ({ name, approvers, threshold, permissions }: CreatePolicyOptions) => {
      const r = await mutation({
        variables: {
          input: {
            account,
            name,
            approvers: [...approvers],
            threshold,
            permissions: {
              targets: Object.entries(permissions.targets).map(([to, selectors]) => ({
                to,
                selectors: [...selectors],
              })),
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
