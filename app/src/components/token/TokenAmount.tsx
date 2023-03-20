import { Token } from '@token/token';
import { useFormattedNumber } from '../format/FormattedNumber';

export interface FormattedTokenAmountOptions {
  token: Token;
  amount?: bigint;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token,
  amount = 0n,
  trailing = 'symbol',
}: FormattedTokenAmountOptions) =>
  useFormattedNumber({
    value: amount,
    decimals: token.decimals,
    maximumFractionDigits: 3,
    extendedFractionDigits: 4,
    postFormat: trailing ? (v) => `${v} ${token[trailing]}` : undefined,
  });

export interface TokenAmountProps extends FormattedTokenAmountOptions {}

export const TokenAmount = (props: TokenAmountProps) => <>{useFormattedTokenAmount(props)}</>;
