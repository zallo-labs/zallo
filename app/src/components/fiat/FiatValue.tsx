import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';

const currency = 'USD';

const withoutSymbol = (value: string, currency: string) => value.replace(currency, '').trim();

export interface FormattedFiatOptions extends Partial<Omit<FormattedNumberOptions, 'value'>> {
  value: number;
  symbol?: boolean;
}

export const useFormattedFiat = ({ value, symbol = true, ...options }: FormattedFiatOptions) => {
  return useFormattedNumber({
    value,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    minimumNumberFractionDigits: 3,
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    ...(!symbol && {
      currencyDisplay: 'code',
      postFormat: (v) => withoutSymbol(v, currency),
    }),
    ...options,
  });
};

export interface FormattedFiatProps extends FormattedFiatOptions {}

export const FiatValue = (props: FormattedFiatProps) => <>{useFormattedFiat(props)}</>;
