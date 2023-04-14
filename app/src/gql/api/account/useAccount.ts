import { useMemo } from 'react';
import assert from 'assert';
import { gql } from '@apollo/client';
import { AccountIdlike, asAccountId, WAccount } from './types';
import { useSuspenseQuery } from '~/gql/util';
import { AccountDocument, AccountQuery, AccountQueryVariables } from '@api/generated';
import { asPolicyKey } from 'lib';
import { convertPolicyFragment } from '@api/policy/types';
import { match } from 'ts-pattern';

gql`
  fragment PolicyStateFields on PolicyState {
    id
    proposalId
    createdAt
    isRemoved
    threshold
    approvers {
      userId
    }
    targets {
      to
      selectors
    }
  }

  fragment PolicyFields on Policy {
    id
    key
    name
    active {
      ...PolicyStateFields
    }
    draft {
      ...PolicyStateFields
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

        const active = p.active?.isRemoved ? undefined : convertPolicyFragment(key, p.active);
        const draft = p.draft?.isRemoved ? null : convertPolicyFragment(key, p.draft);
        assert(active || draft);

        return {
          account: id,
          key,
          name: p.name,
          active: active!, // At least one must be present - see assert above
          draft,
          state: match({ active, draft })
            .with({ active: undefined }, () => 'add' as const)
            .with({ draft: undefined }, () => 'active' as const)
            .with({ draft: null }, () => 'remove' as const)
            .otherwise(() => 'edit' as const),
        };
      }),
    };
  }, [data, id]);

  if (id) assert(account, `Expected Account '${id}' to exist`);
  return account as Id extends undefined ? WAccount | undefined : WAccount;
};
