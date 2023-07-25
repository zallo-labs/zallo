import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { Address, BigIntlike, asBigInt, isAddress } from 'lib';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query TokenAmount($token: Address!) {
    token(input: { address: $token }) {
      ...UseFormattedTokenAmount_token
    }
  }
`);

const HookFragment = gql(/* GraphQL */ `
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
  token: FragmentType<typeof HookFragment> | Address | null | undefined;
  amount?: BigIntlike;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token: tokenProp,
  amount: amountProp,
  trailing = 'symbol',
  ...options
}: FormattedTokenAmountOptions) => {
  const amount = amountProp ? asBigInt(amountProp) : 0n;

  const query = useQuery(
    Query,
    { token: isAddress(tokenProp) ? tokenProp : '0x' },
    { pause: !isAddress(tokenProp) },
  ).data;

  const token = getFragment(HookFragment, !isAddress(tokenProp) ? tokenProp : query?.token) ?? {
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
    minimumNumberFractionDigits: 4,
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
  token: FragmentType<typeof ComponentFragment> | Address;
}

export function TokenAmount(props: TokenAmountProps) {
  return (
    <>
      {useFormattedTokenAmount({
        ...props,
        token:
          (isAddress(props.token) && props.token) || getFragment(ComponentFragment, props.token),
      })}
    </>
  );
}
