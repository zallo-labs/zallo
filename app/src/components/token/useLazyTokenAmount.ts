import { graphql } from 'relay-runtime';
import { TokenAmountOptions, useTokenAmount } from './useTokenAmount';
import { UAddress } from 'lib';
import { useLazyQuery } from '~/api';
import { useLazyTokenAmountQuery } from '~/api/__generated__/useLazyTokenAmountQuery.graphql';

const Query = graphql`
  query useLazyTokenAmountQuery($token: UAddress!) {
    token(address: $token) {
      ...useTokenAmount_token
    }
  }
`;

export interface LazyTokenAmountOptions extends Omit<TokenAmountOptions, 'token'> {
  token: UAddress;
}

export function useLazyTokenAmount({ token, ...options }: LazyTokenAmountOptions) {
  const query = useLazyQuery<useLazyTokenAmountQuery>(Query, { token });

  return useTokenAmount({ ...options, token: query.token });
}
