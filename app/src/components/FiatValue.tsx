import { BigNumberish } from 'ethers';
import { FIAT_DECIMALS } from '~/token/fiat';
import { FormattedNumber } from './FormattedNumber';

export interface FormattedFiatProps {
  value: BigNumberish;
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
