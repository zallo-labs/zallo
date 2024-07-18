import { UAddress } from 'lib';
import { TokenIcon, TokenIconProps } from './TokenIcon';
import { graphql } from 'relay-runtime';
import { LazyTokenIconQuery } from '~/api/__generated__/LazyTokenIconQuery.graphql';
import { useLazyQuery } from '~/api';

const Query = graphql`
  query LazyTokenIconQuery($token: UAddress!) {
    token(address: $token) {
      ...TokenIcon_token
    }
  }
`;

export interface LazyTokenIconProps extends Omit<TokenIconProps, 'token'> {
  token: UAddress;
}

export function LazyTokenIcon({ token, ...props }: LazyTokenIconProps) {
  const query = useLazyQuery<LazyTokenIconQuery>(Query, { token });

  return <TokenIcon {...props} token={query.token} />;
}
