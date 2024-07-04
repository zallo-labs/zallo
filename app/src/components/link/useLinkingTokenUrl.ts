import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useLinkingTokenUrl_user$key } from '~/api/__generated__/useLinkingTokenUrl_user.graphql';
import { appLink } from '~/lib/appLink';

const User = graphql`
  fragment useLinkingTokenUrl_user on User {
    linkingToken
  }
`;

export interface useLinkingTokenUrlParams {
  user: useLinkingTokenUrl_user$key;
}

export function useLinkingTokenUrl(params: useLinkingTokenUrlParams) {
  const user = useFragment(User, params.user);

  return useMemo(
    () => appLink({ pathname: `/link`, params: { token: user.linkingToken } }),
    [user.linkingToken],
  );
}
