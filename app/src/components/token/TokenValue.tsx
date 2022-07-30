import { Token } from '~/token/token';
import { FormattedNumber } from '@components/FormattedNumber';
import { BigNumberish } from 'ethers';

export interface TokenValueProps {
  token: Token;
  value: BigNumberish;
  symbol?: boolean;
}

export const TokenValue = ({
  token,
  value,
  symbol = true,
}: TokenValueProps) => (
  <FormattedNumber
    value={value}
    unitDecimals={token.decimals}
    maximumFractionDigits={2}
    extendedFractionDigits={3}
    postFormat={symbol ? (v) => `${v} ${token.symbol}` : undefined}
  />
);
