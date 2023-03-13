import { gql } from '@apollo/client';
import { Policy, PolicyGuid } from 'lib';
import { useCallback } from 'react';
import { PolicyFieldsFragmentDoc, useUpdatePolicyMutation } from '@api/generated';
import { asRulesInput } from './useCreatePolicy';

gql`
  ${PolicyFieldsFragmentDoc}

  mutation UpdatePolicy($account: Address!, $key: PolicyKey!, $name: String, $rules: RulesInput) {
    updatePolicy(account: $account, key: $key, name: $name, rules: $rules) {
      ...PolicyFields
    }
  }
`;

export interface UpdatePolicyOptions extends PolicyGuid {
  name?: string;
  rules?: Policy['rules'];
}

export const useUpdatePolicy = () => {
  const [mutate] = useUpdatePolicyMutation();

  return useCallback(
    async ({ account, key, name, rules }: UpdatePolicyOptions) =>
      mutate({
        variables: {
          account,
          key,
          name,
          rules: rules ? asRulesInput(rules) : undefined,
        },
      }),
    [mutate],
  );
};
