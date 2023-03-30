import { Token } from '@token/token';
import { useTokenValue } from '@token/useTokenValue';
import { BigIntlike } from 'lib';
import { FIAT_DECIMALS } from '~/util/token/fiat';
import { FormattedNumberOptions, useFormattedNumber } from '../format/FormattedNumber';

const currency = 'USD';

const withoutSymbol = (value: string, currency: string) => value.replace(currency, '').trim();

export interface FormattedFiatOptions extends Partial<Omit<FormattedNumberOptions, 'value'>> {
  value: BigIntlike | { token: Token; amount: bigint };
  symbol?: boolean;
}

export const useFormattedFiat = ({ value: v, symbol = true, ...options }: FormattedFiatOptions) => {
  const params: Parameters<typeof useTokenValue> =
    typeof v === 'object' && 'token' in v ? [v.token, v.amount] : [undefined, undefined];
  const tokenValue = useTokenValue(...params);

  return useFormattedNumber({
    value: typeof v === 'object' && 'token' in v ? tokenValue : v,
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
};

export interface FormattedFiatProps extends FormattedFiatOptions {}

export const FiatValue = (props: FormattedFiatProps) => <>{useFormattedFiat(props)}</>;
