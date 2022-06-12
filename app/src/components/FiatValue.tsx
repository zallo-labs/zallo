import { FIAT_DECIMALS } from '~/token/fiat';
import { FormattedNumber, Numberish } from './FormattedNumber';

export interface FormattedFiatProps {
  value: Numberish;
}

export const FiatValue = ({ value }: FormattedFiatProps) => (
  <FormattedNumber
    value={value}
    unitDecimals={FIAT_DECIMALS}
    maximumFractionDigits={2}
    extendedFractionDigits={3}
    style="currency"
    currency="USD"
  />
);
