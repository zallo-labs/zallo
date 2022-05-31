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
    let v = value;
    if (BigNumber.isBigNumber(v))
      v = `${ethers.utils.formatUnits(v, token.decimals)} ${token.symbol}`;

    if (typeof v === 'string') v = parseFloat(v);

    return `${intl.formatNumber(v)} ${token.symbol}`;
  }, [token, value, intl]);

  return <>{formatted}</>;
};
