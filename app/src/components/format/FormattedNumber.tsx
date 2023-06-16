import { FormatNumberOptions, useIntl } from 'react-intl';
import { formatUnits } from 'ethers/lib/utils';

export interface FormattedNumberOptions extends FormatNumberOptions {
  value: bigint | number;
  decimals?: number;
  minimumNumberFractionDigits?: number;
  postFormat?: (value: string) => string;
  hideZero?: boolean;
}

export function useFormattedNumber({
  value: valueProp,
  decimals = 0,
  maximumFractionDigits = 2,
  minimumNumberFractionDigits = maximumFractionDigits,
  postFormat,
  hideZero,
  ...formatOpts
}: FormattedNumberOptions) {
  const intl = useIntl();

  const minRegularNumber = 1 / 10 ** maximumFractionDigits;
  const minNumber = 1 / 10 ** minimumNumberFractionDigits;

  let n = typeof valueProp === 'number' ? valueProp : parseFloat(formatUnits(valueProp, decimals));
  if (n === 0 && hideZero) return '';

  const isLtMin = n < minNumber && n > 0;
  if (isLtMin) n = minNumber;

  let formatted = intl.formatNumber(n, {
    maximumFractionDigits:
      Math.abs(n) < minRegularNumber ? minimumNumberFractionDigits : maximumFractionDigits,
    ...formatOpts,
  });

  if (postFormat) formatted = postFormat(formatted);

  return isLtMin ? `< ${formatted}` : formatted;
}

export interface FormattedNumberProps extends FormattedNumberOptions {}

export const FormattedNumber = (props: FormattedNumberProps) => <>{useFormattedNumber(props)}</>;
