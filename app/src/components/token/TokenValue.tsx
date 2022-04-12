import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { BigNumber, ethers } from 'ethers';

import { Token } from '~/token/token';

export interface TokenValueProps {
  token: Token;
  value: BigNumber;
}

export const TokenValue = ({ token, value }: TokenValueProps) => {
  const intl = useIntl();

  const formatted = useMemo(() => {
    const v = `${ethers.utils.formatUnits(value, token.decimals)} ${token.symbol}`;

    return `${intl.formatNumber(parseFloat(v))} ${token.symbol}`;
  }, [token, value, intl]);

  return <>{formatted}</>;
};
