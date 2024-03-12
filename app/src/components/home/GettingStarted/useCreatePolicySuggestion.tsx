import { FragmentType, gql, useFragment } from '@api';
import { PolicyIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { Suggestion } from '#/home/GettingStarted/suggestions';
import { ListItem } from '#/list/ListItem';

const Account = gql(/* GraphQL */ `
  fragment useCreatePolicySuggestion_Account on Account {
    id
    address
    policies {
      id
      active
      initState
    }
  }
`);

export interface UseCreatePolicySuggestionParams {
  account: FragmentType<typeof Account>;
}

export function useCreatePolicySuggestion(props: UseCreatePolicySuggestionParams): Suggestion {
  const account = useFragment(Account, props.account);

  return {
    Item: (props) => (
      <Link
        href={{
          pathname: `/(drawer)/[account]/policies/[id]/`,
          params: { account: account.address, id: 'add' },
        }}
        asChild
      >
        <ListItem leading={PolicyIcon} headline="Create a policy" {...props} />
      </Link>
    ),
    complete: account.policies.some((p) => p.active && !p.initState),
  };
}
