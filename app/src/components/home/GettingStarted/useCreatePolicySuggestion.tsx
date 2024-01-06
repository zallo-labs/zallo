import { useRouter } from 'expo-router';

import { Suggestion } from '~/components/home/GettingStarted/suggestions';
import { ListItem } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { PolicyIcon } from '~/util/theme/icons';

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
  const router = useRouter();

  return {
    Item: (props) => (
      <ListItem
        leading={PolicyIcon}
        headline="Create a policy"
        onPress={() =>
          router.push({
            pathname: `/(drawer)/[account]/policies/[key]/`,
            params: { account: account.address, key: 'add' },
          })
        }
        {...props}
      />
    ),
    complete: account.policies.filter((p) => p.state).length > 1,
  };
}
