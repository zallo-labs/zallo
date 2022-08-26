import { Token } from '@token/token';
import { BigNumberish } from 'ethers';
import { ZERO } from 'lib';
import { FormattedNumber } from '../format/FormattedNumber';

export interface TokenAmountProps {
  token: Token;
  amount?: BigNumberish;
  symbol?: boolean;
}

export const TokenAmount = ({
  token,
  amount = ZERO,
  symbol = true,
}: TokenAmountProps) => (
  <FormattedNumber
    value={amount}
    unitDecimals={token.decimals}
    maximumFractionDigits={3}
    extendedFractionDigits={4}
    postFormat={symbol ? (v) => `${v} ${token.symbol}` : undefined}
  />
);
