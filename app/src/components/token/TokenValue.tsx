import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { BigNumber, ethers } from 'ethers';

import { Token } from '~/token/token';

export interface TokenValueProps {
  token: Token;
  value: number | string | BigNumber;
}

export const TokenValue = ({ token, value }: TokenValueProps) => {
  const intl = useIntl();

  const formatted = useMemo(() => {
    if (BigNumber.isBigNumber(value))
      value = `${ethers.utils.formatUnits(value, token.decimals)} ${token.symbol}`;
    if (typeof value === 'string') value = parseFloat(value);

    return `${intl.formatNumber(value)} ${token.symbol}`;
  }, [token, value, intl]);

  return <>{formatted}</>;
};
