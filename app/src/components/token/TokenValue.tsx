import { Token } from '@token/token';
import { BigNumberish } from 'ethers';
import { FormattedNumber } from '../format/FormattedNumber';

export interface TokenValueProps {
  token: Token;
  value: BigNumberish;
  symbol?: boolean;
}

export const TokenValue = ({
  token,
  value,
  symbol = true,
}: TokenValueProps) => {
  return (
    <FormattedNumber
      value={value}
      unitDecimals={token.decimals}
      maximumFractionDigits={2}
      extendedFractionDigits={3}
      postFormat={symbol ? (v) => `${v} ${token.symbol}` : undefined}
    />
  );
};
