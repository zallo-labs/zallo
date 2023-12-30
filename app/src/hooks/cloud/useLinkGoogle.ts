import { FragmentType, gql, useFragment } from '@api';
import { useMutation } from 'urql';
import { authContext } from '@api/client';
import { useGetGoogleApprover } from '~/hooks/cloud/useGetGoogleApprover';
import { showError } from '~/components/provider/SnackbarProvider';
import { ampli } from '~/lib/ampli';

const User = gql(/* GraphQL */ `
  fragment useLinkGoogle_User on User {
    id
    linkingToken
  }
`);

const Link = gql(/* GraphQL */ `
  mutation UseLinkGoogle_Link($token: String!) {
    link(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`);

export interface UseLinkGoogleProps {
  user: FragmentType<typeof User>;
  signOut?: boolean;
}

export function useLinkGoogle({ signOut, ...props }: UseLinkGoogleProps) {
  const user = useFragment(User, props.user);
  const getApprover = useGetGoogleApprover();
  const link = useMutation(Link)[1];

  if (!getApprover) return undefined;

  return async () => {
    const r = await getApprover({ signOut });
    if (r.isErr())
      return showError('Something went wrong, failed to link Google account', {
        event: { error: r.error },
      });

    const { approver } = r.value;
    await link({ token: user.linkingToken }, await authContext(approver));
    ampli.socialLinked({ cloud: 'Google' });

    return r.value;
  };
}
