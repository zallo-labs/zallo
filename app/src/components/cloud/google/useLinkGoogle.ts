import { showError } from '#/provider/SnackbarProvider';
import { ampli } from '~/lib/ampli';
import { useGetGoogleApprover } from '#/cloud/google/useGetGoogleApprover';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { useLinkGoogle_user$key } from '~/api/__generated__/useLinkGoogle_user.graphql';
import { useMutation } from '~/api';
import { signAuthToken } from '~/api/auth-manager';

const User = graphql`
  fragment useLinkGoogle_user on User {
    id
    linkingToken
  }
`;

const Link = graphql`
  mutation useLinkGoogleMutation($token: String!) {
    link(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`;

export interface UseLinkGoogleProps {
  user: useLinkGoogle_user$key;
}

export function useLinkGoogle(props: UseLinkGoogleProps) {
  const user = useFragment(User, props.user);
  const getApprover = useGetGoogleApprover();
  const link = useMutation(Link);

  if (!getApprover) return undefined;

  return async () => {
    const r = await getApprover();
    if (r.isErr()) {
      if (r.error !== 'cancelled')
        showError('Something went wrong, failed to sign into Google', {
          event: { error: r.error },
        });
      return null;
    }

    const approver = r.value;
    await link({ token: user.linkingToken }, { authToken: await signAuthToken(approver) });
    ampli.socialLinked({ cloud: 'Google' });

    return approver.address;
  };
}
