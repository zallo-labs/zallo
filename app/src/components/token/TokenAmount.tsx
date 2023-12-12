import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { Decimallike, UAddress, isUAddress } from 'lib';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useQuery } from '~/gql';
import Decimal from 'decimal.js';
import { UseFormattedTokenAmount_TokenFragment } from '@api/generated/graphql';

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
  amount?: Decimallike;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token: tokenProp,
  amount: amountProp,
  trailing = 'symbol',
  ...options
}: FormattedTokenAmountOptions) => {
  const amount = amountProp ? new Decimal(amountProp) : new Decimal('0');

  const query = useQuery(
    Query,
    { token: isUAddress(tokenProp) ? tokenProp : 'zksync:0x' },
    { pause: !isUAddress(tokenProp) },
  ).data;

  const token =
    getFragment(Token, !isUAddress(tokenProp) ? tokenProp : query?.token) ??
    ({
      id: '',
      name: '???',
      symbol: '???',
      // units: [] as { symbol: string; decimals: number }[],
    } as UseFormattedTokenAmount_TokenFragment);

  // Format with the closest unit
  const amountDecimals = amount.decimalPlaces();
  const unit =
    trailing !== 'symbol' || amount.eq(0)
      ? token
      : [token, ...(token.units ?? [])].reduce((closest, unit) => {
          const diff = Math.abs(unit.decimals - amountDecimals);
          return diff < Math.abs(closest.decimals - amountDecimals) ? unit : closest;
        }, token);

  return useFormattedNumber({
    value: amount,
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
