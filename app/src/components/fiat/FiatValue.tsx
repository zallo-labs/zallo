import { BigIntlike } from 'lib';
import { FIAT_DECIMALS } from '~/util/token/fiat';
import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';

const currency = 'USD';

const withoutSymbol = (value: string, currency: string) => value.replace(currency, '').trim();

export interface FormattedFiatOptions extends Partial<FormattedNumberOptions> {
  value: BigIntlike;
  symbol?: boolean;
}

export const useFormattedFiat = ({ value, symbol = true, ...options }: FormattedFiatOptions) =>
  useFormattedNumber({
    value,
    decimals: FIAT_DECIMALS,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    extendedFractionDigits: 3,
    style: 'currency',
    currency,
    ...(!symbol && {
      currencyDisplay: 'code',
      postFormat: (v) => withoutSymbol(v, currency),
    }),
    ...options,
  });

export interface FormattedFiatProps extends FormattedFiatOptions {}

export const FiatValue = (props: FormattedFiatProps) => <>{useFormattedFiat(props)}</>;
