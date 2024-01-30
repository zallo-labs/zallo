import { FragmentType, gql, useFragment } from '@api';
import { PolicyIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { Suggestion } from '~/components/home/GettingStarted/suggestions';
import { ListItem } from '~/components/list/ListItem';

const Account = gql(/* GraphQL */ `
  fragment useCreatePolicySuggestion_Account on Account {
    id
    address
    policies {
      id
      state {
        id
      }
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
          pathname: `/(drawer)/[account]/policies/[key]/`,
          params: { account: account.address, key: 'add' },
        }}
        asChild
      >
        <ListItem leading={PolicyIcon} headline="Create a policy" {...props} />
      </Link>
    ),
    complete: account.policies.filter((p) => p.state).length > 1,
  };
}
