import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { Decimallike, UAddress, isUAddress } from 'lib';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useQuery } from '~/gql';
import Decimal from 'decimal.js';
import { UseFormattedTokenAmount_TokenFragment } from '@api/generated/graphql';

const Query = gql(/* GraphQL */ `
  query TokenAmount($token: UAddress!) {
    token(address: $token) {
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
  amount: Decimallike | undefined;
}

export const useFormattedTokenAmount = ({
  token: tokenProp,
  amount: amountProp,
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
    } as UseFormattedTokenAmount_TokenFragment);

  const d = token.decimals - (amount.toFixed().match(/\.(0*)/)?.[1]?.length ?? 0);
  const units = [token, ...(token.units ?? [])].sort((a, b) => b.decimals - a.decimals /* desc */);
  const unit = amount.eq(0)
    ? token
    : units.reduce(
        // Find the closest unit; bias the smaller unit (-1)
        (closest, unit) =>
          Math.abs(unit.decimals - d) - 1 <= Math.abs(closest.decimals - d) ? unit : closest,
        units[0],
      );

  const unitAmount = amount.mul(new Decimal(10).pow(token.decimals - unit.decimals));

  return useFormattedNumber({
    value: unitAmount,
    maximumFractionDigits: 3,
    minimumNumberFractionDigits: 5,
    postFormat: (v) => `${v} ${unit.symbol}`,
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
