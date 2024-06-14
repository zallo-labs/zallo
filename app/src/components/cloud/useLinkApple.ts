import { FragmentType, gql, useFragment } from '@api';
import { useGetAppleApprover } from './useGetAppleApprover';
import { useMutation } from 'urql';
import { authContext } from '@api/client';
import { showError } from '#/provider/SnackbarProvider';
import { ampli } from '~/lib/ampli';

const User = gql(/* GraphQL */ `
  fragment useLinkApple_User on User {
    id
    linkingToken
  }
`);

const Link = gql(/* GraphQL */ `
  mutation LinkAppleButton_Link($token: String!) {
    link(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`);

export interface useLinkAppleParams {
  user: FragmentType<typeof User>;
}

export function useLinkApple(params: useLinkAppleParams) {
  const user = useFragment(User, params.user);
  const getApprover = useGetAppleApprover();
  const link = useMutation(Link)[1];

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
    await link({ token: user.linkingToken }, await authContext(approver));
    ampli.socialLinked({ cloud: 'Apple' });

    return r.value.address;
  };
}
