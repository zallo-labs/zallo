import { FragmentType, gql, useFragment } from '@api';
import { useApproverAddress } from '~/lib/network/useApprover';
import { GoogleIcon } from '@theme/icons';
import { Suggestion } from '~/components/home/GettingStarted/suggestions';
import { ListItem } from '~/components/list/ListItem';
import { useLinkGoogle } from '~/hooks/cloud/useLinkGoogle';

const User = gql(/* GraphQL */ `
  fragment useLinkGoogleSuggestion_User on User {
    id
    approvers {
      id
      address
      cloud {
        provider
      }
    }
    ...useLinkGoogle_User
  }
`);

export interface UseLinkGoogleSuggestionProps {
  user: FragmentType<typeof User>;
}

export function useLinkGoogleSuggestion(
  props: UseLinkGoogleSuggestionProps,
): Suggestion | undefined {
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const link = useLinkGoogle({ user });

  if (!link) return undefined;

  return {
    Item: (props) => (
      <ListItem leading={GoogleIcon} headline="Link Google account" onPress={link} {...props} />
    ),
    complete: !!user.approvers.find(
      (a) => a.address !== approver && a.cloud?.provider === 'Google',
    ),
  };
}
