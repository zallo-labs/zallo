import { FragmentType, gql, useFragment } from '@api';
import { useApproverAddress } from '~/lib/network/useApprover';
import { AppleBlackIcon, AppleWhiteIcon } from '@theme/icons';
import { Suggestion } from '#/home/GettingStarted/suggestions';
import { ListItem } from '#/list/ListItem';
import { useLinkApple } from '#/cloud/useLinkApple';

const User = gql(/* GraphQL */ `
  fragment useLinkAppleSuggestion_User on User {
    id
    approvers {
      id
      address
      cloud {
        provider
      }
    }
    ...useLinkApple_User
  }
`);

export interface useLinkAppleSuggestionProps {
  user: FragmentType<typeof User>;
}

export function useLinkAppleSuggestion(props: useLinkAppleSuggestionProps): Suggestion | undefined {
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const link = useLinkApple({ user });

  if (!link) return undefined;

  return {
    Item: (props) => (
      <ListItem leading={AppleBlackIcon} headline="Link Apple Account" onPress={link} {...props} />
    ),
    complete: !!user.approvers.find((a) => a.address !== approver && a.cloud?.provider === 'Apple'),
  };
}
