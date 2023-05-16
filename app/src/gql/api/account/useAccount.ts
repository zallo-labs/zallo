import { useMemo } from 'react';
import assert from 'assert';
import { gql } from '@apollo/client';
import { AccountIdlike, asAccountId, WAccount } from './types';
import { useSuspenseQuery } from '~/gql/util';
import { AccountDocument, AccountQuery, AccountQueryVariables } from '@api/generated';
import { asPolicyKey } from 'lib';
import { convertPolicyFragment } from '@api/policy/types';
import { match } from 'ts-pattern';
import { truncateAddr } from '~/util/format';

gql`
  fragment PolicyStateFields on PolicyState {
    id
    proposal {
      id
      hash
    }
    createdAt
    isRemoved
    threshold
    approvers {
      address
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
    state {
      ...PolicyStateFields
    }
    draft {
      ...PolicyStateFields
    }
  }

  fragment AccountFields on Account {
    id
    address
    name
    isActive
    policies {
      ...PolicyFields
    }
  }

  query Account($input: AccountInput!) {
    account(input: $input) {
      ...AccountFields
    }
  }
`;

export const useAccount = <Id extends AccountIdlike | undefined>(AccountIdlike: Id) => {
  const address = asAccountId(AccountIdlike);

  const query = useSuspenseQuery<AccountQuery, AccountQueryVariables>(AccountDocument, {
    variables: { input: { address: address! } },
    skip: !address,
  });

  const data = query.data.account;
  const account = useMemo((): WAccount | undefined => {
    if (!address || !data) return undefined;

    return {
      id: data.id,
      address: data.address,
      name: data.name ?? truncateAddr(data.address),
      isActive: data.isActive,
      policies: (data.policies ?? []).map((p) => {
        const key = asPolicyKey(p.key);

        const state = p.state?.isRemoved ? undefined : convertPolicyFragment(key, p.state);
        const draft = p.draft?.isRemoved ? null : convertPolicyFragment(key, p.draft);
        assert(state || draft);

        return {
          account: address,
          key,
          name: p.name,
          state: state!, // At least one must be present - see assert above
          draft,
          status: match({ active: state, draft })
            .with({ active: undefined }, () => 'add' as const)
            .with({ draft: undefined }, () => 'active' as const)
            .with({ draft: null }, () => 'remove' as const)
            .otherwise(() => 'edit' as const),
        };
      }),
    };
  }, [data, address]);

  if (address && !account) throw new Error(`Expected Account '${address}' to exist`);
  return account as Id extends undefined ? WAccount | undefined : WAccount;
};
