import { Token } from '~/token/token';
import { FormattedNumber } from '@components/FormattedNumber';
import { BigNumberish } from 'ethers';

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
