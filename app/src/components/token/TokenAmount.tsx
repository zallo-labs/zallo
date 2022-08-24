import { Token } from '@token/token';
import { BigNumberish } from 'ethers';
import { FormattedNumber } from '../format/FormattedNumber';

export interface TokenAmountProps {
  token: Token;
  amount: BigNumberish;
  symbol?: boolean;
}

export const TokenAmount = ({
  token,
  amount,
  symbol = true,
}: TokenAmountProps) => (
  <FormattedNumber
    value={amount}
    unitDecimals={token.decimals}
    maximumFractionDigits={2}
    extendedFractionDigits={3}
    postFormat={symbol ? (v) => `${v} ${token.symbol}` : undefined}
  />
);
