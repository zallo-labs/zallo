import { useMemo } from 'react';
import assert from 'assert';
import { gql } from '@apollo/client';
import { AccountIdlike, asAccountId, Removable, REMOVAL, WAccount } from './types';
import { useSuspenseQuery } from '~/gql/util';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  PolicyRulesFieldsFragment,
} from '@api/generated';
import {
  ApprovalsRule,
  asAddress,
  asPolicyKey,
  asSelector,
  FunctionsRule,
  isTruthy,
  Policy,
  PolicyKey,
  TargetsRule,
} from 'lib';

gql`
  fragment PolicyRulesFields on PolicyRules {
    id
    proposalId
    createdAt
    isRemoved
    approvers {
      userId
    }
    onlyFunctions
    onlyTargets
  }

  fragment PolicyFields on Policy {
    id
    key
    name
    active {
      ...PolicyRulesFields
    }
    draft {
      ...PolicyRulesFields
    }
  }

  fragment AccountFields on Account {
    id
    name
    isActive
    policies {
      ...PolicyFields
    }
  }

  query Account($id: Address!) {
    account(id: $id) {
      ...AccountFields
    }
  }
`;

export const useAccount = <Id extends AccountIdlike | undefined>(AccountIdlike: Id) => {
  const id = asAccountId(AccountIdlike);

  const query = useSuspenseQuery<AccountQuery, AccountQueryVariables>(AccountDocument, {
    variables: { id },
    skip: !id,
  });

  const data = query.data.account;
  const account = useMemo((): WAccount | undefined => {
    if (!id || !data) return undefined;

    return {
      id,
      name: data.name,
      isActive: data.isActive,
      policies: (data.policies ?? []).map((p) => {
        const key = asPolicyKey(p.key);

        const active = convertPolicyFragment(key, p.active);
        const draft = convertPolicyFragment(key, p.draft);
        assert(active || draft);

        return {
          account: id,
          key,
          name: p.name,
          active: active!, // At least one must be present - see assert above
          draft,
        };
      }),
    };
  }, [data, id]);

  if (id) assert(account);
  return account as Id extends undefined ? WAccount | undefined : WAccount;
};

function convertPolicyFragment(
  key: PolicyKey,
  r: PolicyRulesFieldsFragment | null | undefined,
): Removable<Policy> | undefined {
  if (!r) return undefined;
  if (r.isRemoved) return REMOVAL;

  return new Policy(
    key,
    ...[
      r.approvers &&
        r.approvers?.length > 0 &&
        new ApprovalsRule(r.approvers.map((a) => asAddress(a.userId))),
      r.onlyFunctions &&
        r.onlyFunctions.length > 0 &&
        new FunctionsRule(r.onlyFunctions.map(asSelector)),
      r.onlyTargets && r.onlyTargets.length > 0 && new TargetsRule(r.onlyTargets.map(asAddress)),
    ].filter(isTruthy),
  );
}
