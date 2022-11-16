import { BigNumberish } from 'ethers';
import { FIAT_DECIMALS } from '~/util/token/fiat';
import { FormattedNumber } from '../format/FormattedNumber';

const currency = 'USD';

const withoutSymbol = (value: string, currency: string) => value.replace(currency, '').trim();

export interface FormattedFiatProps {
  value: BigNumberish;
  symbol?: boolean;
}

export const FiatValue = ({ value, symbol = true }: FormattedFiatProps) => {
  return (
    <FormattedNumber
      value={value}
      unitDecimals={FIAT_DECIMALS}
      minimumFractionDigits={0}
      maximumFractionDigits={2}
      extendedFractionDigits={3}
      style="currency"
      currency={currency}
      {...(!symbol && {
        currencyDisplay: 'code',
        postFormat: (v) => withoutSymbol(v, currency),
      })}
    />
  );
};
