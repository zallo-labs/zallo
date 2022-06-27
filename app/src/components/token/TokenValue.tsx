import { Token } from '~/token/token';
import { FormattedNumber, Numberish } from '@components/FormattedNumber';

export interface TokenValueProps {
  token: Token;
  value: Numberish;
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
