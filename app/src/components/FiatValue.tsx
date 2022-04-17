import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { BigNumber, ethers } from 'ethers';

import { FIAT_DECIMALS } from '~/token/fiat';

export interface FormattedFiatProps {
  value: number | string | BigNumber;
}

export const FiatValue = ({ value }: FormattedFiatProps) => {
  const intl = useIntl();

  const formatted = useMemo(() => {
    if (BigNumber.isBigNumber(value)) value = ethers.utils.formatUnits(value, FIAT_DECIMALS);
    if (typeof value === 'string') value = parseFloat(value);

    return intl.formatNumber(value, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }, [value, intl]);

  return <>{formatted}</>;
};
