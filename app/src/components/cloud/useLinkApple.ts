import { useGetAppleApprover } from './useGetAppleApprover';
import { showError } from '#/provider/SnackbarProvider';
import { ampli } from '~/lib/ampli';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { useLinkApple_user$key } from '~/api/__generated__/useLinkApple_user.graphql';
import { useMutation } from '~/api';
import { signAuthHeaders } from '~/api/auth-manager';

const User = graphql`
  fragment useLinkApple_user on User {
    id
    linkingToken
  }
`;

const Link = graphql`
  mutation useLinkAppleMutation($token: String!) {
    link(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`;

export interface useLinkAppleParams {
  user: useLinkApple_user$key;
}

export function useLinkApple(params: useLinkAppleParams) {
  const user = useFragment(User, params.user);
  const getApprover = useGetAppleApprover();
  const link = useMutation(Link);

  if (!getApprover) return undefined;

  return async () => {
    const r = await getApprover({});
    if (r.isErr()) {
      if (r.error !== 'ERR_REQUEST_CANCELED')
        showError('Something went wrong, failed to sign in with Apple', {
          event: { error: r.error },
        });
      return null;
    }

    const approver = r.value;
    await link({ token: user.linkingToken }, { headers: await signAuthHeaders(approver) });
    ampli.socialLinked({ cloud: 'Apple' });

    return r.value.address;
  };
}
