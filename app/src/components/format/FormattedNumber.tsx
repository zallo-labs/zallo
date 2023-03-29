import { useMemo } from 'react';
import { FormatNumberOptions, useIntl } from 'react-intl';
import { BigIntlike } from 'lib';
import { formatUnits } from 'ethers/lib/utils';

export interface FormattedNumberOptions extends FormatNumberOptions {
  value: BigIntlike;
  decimals?: number;
  extendedFractionDigits?: number;
  postFormat?: (value: string) => string;
}

export const useFormattedNumber = ({
  value,
  decimals = 1,
  maximumFractionDigits = 2,
  extendedFractionDigits,
  postFormat,
  ...formatOpts
}: FormattedNumberOptions) => {
  const intl = useIntl();

  const extendedFracDigits = extendedFractionDigits ?? maximumFractionDigits;
  const extendedMin = 1 / 10 ** extendedFracDigits;
  const maxMin = 1 / 10 ** maximumFractionDigits;

  const formatted = useMemo(() => {
    let v = typeof value === 'number' ? value : parseFloat(formatUnits(value, decimals));

    const isLt = v < extendedMin && v > 0;
    if (isLt) v = extendedMin;

    let formatted = intl.formatNumber(v, {
      maximumFractionDigits: v < maxMin ? extendedFracDigits : maximumFractionDigits,
      ...formatOpts,
    });

    if (postFormat) formatted = postFormat(formatted);

    return isLt ? `< ${formatted}` : formatted;
  }, [
    value,
    decimals,
    extendedMin,
    intl,
    maxMin,
    extendedFracDigits,
    maximumFractionDigits,
    formatOpts,
    postFormat,
  ]);

  return formatted;
};

export interface FormattedNumberProps extends FormattedNumberOptions {}

export const FormattedNumber = (props: FormattedNumberProps) => <>{useFormattedNumber(props)}</>;
