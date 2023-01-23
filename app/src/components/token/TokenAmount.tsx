import { Token } from '@token/token';
import { BigNumberish } from 'ethers';
import { ZERO } from 'lib';
import { useFormattedNumber } from '../format/FormattedNumber';

export interface FormattedTokenAmountOptions {
  token: Token;
  amount?: BigNumberish;
  trailing?: 'name' | 'symbol' | false;
}

export const useFormattedTokenAmount = ({
  token,
  amount = ZERO,
  trailing = 'symbol',
}: FormattedTokenAmountOptions) =>
  useFormattedNumber({
    value: amount,
    unitDecimals: token.decimals,
    maximumFractionDigits: 3,
    extendedFractionDigits: 4,
    postFormat: trailing ? (v) => `${v} ${token[trailing]}` : undefined,
  });

export interface TokenAmountProps extends FormattedTokenAmountOptions {}

export const TokenAmount = (props: TokenAmountProps) => <>{useFormattedTokenAmount(props)}</>;
