import Decimal from 'decimal.js';
import { Decimallike } from 'lib';
import { FormatNumberOptions, useIntl } from 'react-intl';

export interface FormattedNumberOptions extends FormatNumberOptions {
  value: Decimallike | bigint;
  minimumNumberFractionDigits?: number;
  postFormat?: (value: string) => string;
  hideZero?: boolean;
}

export function useFormattedNumber({
  value: valueProp,
  maximumFractionDigits = 2,
  minimumNumberFractionDigits = maximumFractionDigits,
  postFormat,
  hideZero,
  ...formatOpts
}: FormattedNumberOptions) {
  const intl = useIntl();

  let n = new Decimal(valueProp.toString()).toNumber();
  if (n === 0 && hideZero) return '';

  const minRegularNumber = 1 / 10 ** maximumFractionDigits;
  const minNumber = 1 / 10 ** minimumNumberFractionDigits;
  const isLtMin = n !== 0 && Math.abs(n) < minNumber;
  if (isLtMin) n = minNumber * (n < 0 ? -1 : 1);

  let formatted = intl.formatNumber(n, {
    ...formatOpts,
    maximumFractionDigits:
      Math.abs(n) < minRegularNumber ? minimumNumberFractionDigits : maximumFractionDigits,
  });

  if (postFormat) formatted = postFormat(formatted);

  return isLtMin ? `< ${formatted}` : formatted;
}

export interface FormattedNumberProps extends FormattedNumberOptions {}

export const FormattedNumber = (props: FormattedNumberProps) => <>{useFormattedNumber(props)}</>;
