import { useRouter } from 'expo-router';

import { Suggestion } from '~/components/home/GettingStarted/suggestions';
import { ListItem } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { useApproverAddress } from '~/lib/network/useApprover';
import { DevicesIcon } from '~/util/theme/icons';

const User = gql(/* GraphQL */ `
  fragment useLinkDeviceSuggestion_User on User {
    id
    approvers {
      id
      address
      bluetoothDevices
      cloud {
        id
        provider
      }
    }
  }
`);

export interface UseLinkDeviceSuggestionProps {
  user: FragmentType<typeof User>;
}

export function useLinkDeviceSuggestion(props: UseLinkDeviceSuggestionProps): Suggestion {
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const router = useRouter();

  return {
    Item: (props) => (
      <ListItem
        leading={DevicesIcon}
        headline="Link a device"
        onPress={() => router.push(`/link/`)}
        {...props}
      />
    ),
    complete: !!user.approvers.find(
      (a) => a.address !== approver && !a.bluetoothDevices?.length && !a.cloud,
    ),
  };
}
