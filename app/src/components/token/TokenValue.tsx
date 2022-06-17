import { Token } from '~/token/token';
import { FormattedNumber, Numberish } from '@components/FormattedNumber';

export interface TokenValueProps {
  token: Token;
  value: Numberish;
}

export const TokenValue = ({ token, value }: TokenValueProps) => (
  <FormattedNumber
    value={value}
    unitDecimals={token.decimals}
    maximumFractionDigits={2}
    extendedFractionDigits={3}
    postFormat={(v) => `${v} ${token.symbol}`}
  />
);
