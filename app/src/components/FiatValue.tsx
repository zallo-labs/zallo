import { useMemo } from 'react';
import { useIntl } from 'react-intl';

export interface FiatValueProps {
  value: number | string;
}

export const FiatValue = ({ value }: FiatValueProps) => {
  const intl = useIntl();

  const formatted = useMemo(() => {
    const v = typeof value === 'number' ? value : parseFloat(value);

    return intl.formatNumber(v, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  }, [value, intl]);

  return <>{formatted}</>;
};
