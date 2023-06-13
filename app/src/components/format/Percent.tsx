import { useFormattedNumber } from './FormattedNumber';

export interface FormattedPercentOptions {
  value: number;
  leading?: 'sign';
  sign?: boolean;
}

export const useFormattedPercent = ({ value, leading, sign = true }: FormattedPercentOptions) =>
  useFormattedNumber({
    value,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    // extendedFractionDigits: 2,
    // postFormat: (v) => `${v}%`,
    postFormat:
      leading || sign
        ? (v) => `${leading === 'sign' && !v.startsWith('-') ? '+' : ''}${v}${sign ? '%' : ''}`
        : undefined,
  });

export interface PercentProps extends FormattedPercentOptions {}

export const Percent = (props: PercentProps) => <>{useFormattedPercent(props)}</>;
