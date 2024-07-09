import { graphql } from 'relay-runtime';
import { TokenAmountOptions, useTokenAmount } from './useTokenAmount';
import { TokenAmount_token$key } from '~/api/__generated__/TokenAmount_token.graphql';
import { useFragment } from 'react-relay';

const Token = graphql`
  fragment TokenAmount_token on Token {
    ...useTokenAmount_token
  }
`;

export interface TokenAmountProps extends Omit<TokenAmountOptions, 'token'> {
  token: TokenAmount_token$key;
}

export function TokenAmount(props: TokenAmountProps) {
  const token = useFragment(Token, props.token);
  return <>{useTokenAmount({ ...props, token })}</>;
}
