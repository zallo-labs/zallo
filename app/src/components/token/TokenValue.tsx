import { Token } from '~/token/token';
import { FormattedNumber } from '@components/FormattedNumber';
import { BigNumberish } from 'ethers';

export interface TokenValueProps {
  token: Token;
  value: BigNumberish;
  noSymbol?: boolean;
}

export const TokenValue = ({ token, value, noSymbol }: TokenValueProps) => (
  <FormattedNumber
    value={value}
    unitDecimals={token.decimals}
    maximumFractionDigits={2}
    extendedFractionDigits={3}
    postFormat={noSymbol ? undefined : (v) => `${v} ${token.symbol}`}
  />
);
