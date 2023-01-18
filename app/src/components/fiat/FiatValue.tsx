import { BigNumberish } from 'ethers';
import { FIAT_DECIMALS } from '~/util/token/fiat';
import { useFormattedNumber } from '../format/FormattedNumber';

const currency = 'USD';

const withoutSymbol = (value: string, currency: string) => value.replace(currency, '').trim();

export interface FormattedFiatOptions {
  value: BigNumberish;
  symbol?: boolean;
}

export const useFormattedFiat = ({ value, symbol = true }: FormattedFiatOptions) =>
  useFormattedNumber({
    value,
    unitDecimals: FIAT_DECIMALS,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    extendedFractionDigits: 3,
    style: 'currency',
    currency,
    ...(symbol
      ? {}
      : {
          currencyDisplay: 'code',
          postFormat: (v) => withoutSymbol(v, currency),
        }),
  });

export interface FormattedFiatProps extends FormattedFiatOptions {}

export const FiatValue = (props: FormattedFiatProps) => <>{useFormattedFiat(props)}</>;
