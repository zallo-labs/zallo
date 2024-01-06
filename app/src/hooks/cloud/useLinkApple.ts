import { useMutation } from 'urql';

import { showError } from '~/components/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { authContext } from '~/gql/api/client';
import { ampli } from '~/lib/ampli';
import { useGetAppleApprover } from './useGetAppleApprover';

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
    if (r.isErr())
      return showError('Something went wrong, failed to link Apple account', {
        event: { error: r.error },
      });

    const { approver } = r.value;
    await link({ token: user.linkingToken }, await authContext(approver));
    ampli.socialLinked({ cloud: 'Apple' });

    return r.value;
  };
}
