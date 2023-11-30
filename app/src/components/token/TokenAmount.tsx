import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { UAddress, isUAddress } from 'lib';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query TokenAmount($token: UAddress!) {
    token(input: { address: $token }) {
      ...UseFormattedTokenAmount_token
    }
  }
`);

const Token = gql(/* GraphQL */ `
  fragment UseFormattedTokenAmount_token on Token {
    id
    name
    symbol
    decimals
    units {
      symbol
      decimals
    }
  }
`);

export interface FormattedTokenAmountOptions extends Partial<FormattedNumberOptions> {
  token: FragmentType<typeof Token> | UAddress | null | undefined;
  amount?: bigint | number | string;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token: tokenProp,
  amount: amountProp,
  trailing = 'symbol',
  ...options
}: FormattedTokenAmountOptions) => {
  const amount = amountProp ? BigInt(amountProp) : 0n;

  const query = useQuery(
    Query,
    { token: isUAddress(tokenProp) ? tokenProp : 'zksync:0x' },
    { pause: !isUAddress(tokenProp) },
  ).data;

  const token = getFragment(Token, !isUAddress(tokenProp) ? tokenProp : query?.token) ?? {
    id: '',
    name: '???',
    symbol: '???',
    decimals: 0,
  };

  // Format with the closest unit
  const amountDecimals = amount.toString().length;
  const unit =
    trailing !== 'symbol' || amount === 0n
      ? token
      : [token, ...(token.units ?? [])].reduce((closest, unit) => {
          const diff = Math.abs(unit.decimals - amountDecimals);
          return diff < Math.abs(closest.decimals - amountDecimals) ? unit : closest;
        }, token);

  return useFormattedNumber({
    value: amount,
    decimals: unit.decimals,
    maximumFractionDigits: 3,
    minimumNumberFractionDigits: 5,
    postFormat: trailing
      ? (v) => `${v} ${trailing === 'name' ? token.name : unit.symbol}`
      : undefined,
    ...options,
  });
};

const ComponentFragment = gql(/* GraphQL */ `
  fragment TokenAmount_token on Token {
    ...UseFormattedTokenAmount_token
  }
`);

export interface TokenAmountProps extends Omit<FormattedTokenAmountOptions, 'token'> {
  token: FragmentType<typeof ComponentFragment> | UAddress;
}

export function TokenAmount(props: TokenAmountProps) {
  return (
    <>
      {useFormattedTokenAmount({
        ...props,
        token:
          (isUAddress(props.token) && props.token) || getFragment(ComponentFragment, props.token),
      })}
    </>
  );
}
