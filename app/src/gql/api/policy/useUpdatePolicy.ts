import { gql } from '@apollo/client';
import { Address, Policy, PolicyId } from 'lib';
import { useCallback } from 'react';
import { PolicyFieldsFragmentDoc, useUpdatePolicyMutation } from '@api/generated';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation UpdatePolicy($input: UpdatePolicyInput!) {
    updatePolicy(input: $input) {
      ...PolicyFields
    }
  }
`;

export type UpdatePolicyOptions = PolicyId &
  Partial<Policy> & {
    name?: string;
  };

export const useUpdatePolicy = () => {
  const [mutate] = useUpdatePolicyMutation();

  return useCallback(
    async ({ account, key, name, approvers, threshold, permissions: p }: UpdatePolicyOptions) => {
      const r = await mutate({
        variables: {
          input: {
            account,
            key,
            name,
            approvers: approvers ? [...approvers] : undefined,
            threshold: threshold !== undefined ? threshold : undefined,
            permissions: {
              ...(p?.targets && {
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
              }),
            },
          },
        },
      });

      return r.data?.updatePolicy;
    },
    [mutate],
  );
};
