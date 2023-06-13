import { Token, TokenUnit } from '@token/token';
import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';
import { Address } from 'lib';
import { useToken } from '@token/useToken';

export interface FormattedTokenAmountOptions extends Partial<FormattedNumberOptions> {
  token: Token | Address;
  amount?: bigint;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token: tokenProp,
  amount = 0n,
  trailing = 'symbol',
  ...options
}: FormattedTokenAmountOptions) => {
  const token = useToken(typeof tokenProp === 'object' ? tokenProp.address : tokenProp);

  // Format with the closest unit
  const amountDecimals = amount.toString().length;
  const unit: TokenUnit =
    trailing !== 'symbol' || amount === 0n
      ? token
      : token.units.reduce((closest, unit) => {
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

export interface TokenAmountProps extends FormattedTokenAmountOptions {}

export const TokenAmount = (props: TokenAmountProps) => <>{useFormattedTokenAmount(props)}</>;
