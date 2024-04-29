import { FragmentType, gql, useFragment } from '@api';
import { useMemo } from 'react';
import { appLink } from '~/lib/appLink';

const User = gql(/* GraphQL */ `
  fragment useLinkingTokenUrl_User on User {
    linkingToken
  }
`);

export interface useLinkingTokenUrlParams {
  user: FragmentType<typeof User>;
}

export function useLinkingTokenUrl(params: useLinkingTokenUrlParams) {
  const user = useFragment(User, params.user);

  return useMemo(
    () => appLink({ pathname: `/link/token`, params: { token: user.linkingToken } }),
    [user.linkingToken],
  );
}
