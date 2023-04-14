import { gql } from '@apollo/client';
import { Policy, PolicyId } from 'lib';
import { useCallback } from 'react';
import { PolicyFieldsFragmentDoc, useUpdatePolicyMutation } from '@api/generated';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation UpdatePolicy($args: UpdatePolicyInput!) {
    updatePolicy(args: $args) {
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
    async ({ account, key, name, approvers, threshold, permissions }: UpdatePolicyOptions) => {
      const r = await mutate({
        variables: {
          args: {
            account,
            key,
            name,
            approvers: approvers ? [...approvers] : undefined,
            threshold: threshold !== undefined ? threshold : undefined,
            permissions: permissions
              ? {
                  targets: Object.entries(permissions.targets).map(([to, selectors]) => ({
                    to,
                    selectors: [...selectors],
                  })),
                }
              : undefined,
          },
        },
      });

      return r.data?.updatePolicy;
    },
    [mutate],
  );
};
