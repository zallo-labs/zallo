import { FragmentType, gql, useFragment } from '@api';
import { useApproverAddress } from '~/lib/network/useApprover';
import { DevicesIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { Suggestion } from '#/home/GettingStarted/suggestions';
import { ListItem } from '#/list/ListItem';

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

  return {
    Item: (props) => (
      <Link href="/link" asChild>
        <ListItem leading={DevicesIcon} headline="Link a device" {...props} />
      </Link>
    ),
    complete: !!user.approvers.find(
      (a) => a.address !== approver && !a.bluetoothDevices?.length && !a.cloud,
    ),
  };
}
