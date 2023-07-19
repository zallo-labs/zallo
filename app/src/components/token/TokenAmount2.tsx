import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { BigIntlike, asBigInt } from 'lib';
import { FragmentType, gql, useFragment } from '@api/gen';

const HookFragmentDoc = gql(/* GraphQL */ `
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
  token: FragmentType<typeof HookFragmentDoc>;
  amount?: BigIntlike;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token: tokenProp,
  amount: amountProp,
  trailing = 'symbol',
  ...options
}: FormattedTokenAmountOptions) => {
  const token = useFragment(HookFragmentDoc, tokenProp);
  const amount = amountProp ? asBigInt(amountProp) : 0n;

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

const ComponentFragmentDoc = gql(/* GraphQL */ `
  fragment TokenAmount_token on Token {
    ...UseFormattedTokenAmount_token
  }
`);

export interface TokenAmountProps extends Omit<FormattedTokenAmountOptions, 'token'> {
  token: FragmentType<typeof ComponentFragmentDoc>;
}

export function TokenAmount(props: TokenAmountProps) {
  return (
    <>
      {useFormattedTokenAmount({
        ...props,
        token: useFragment(ComponentFragmentDoc, props.token),
      })}
    </>
  );
}
