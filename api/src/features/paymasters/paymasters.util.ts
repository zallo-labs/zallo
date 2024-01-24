import Decimal from 'decimal.js';
import { PaymasterFeeParts } from './paymasters.model';

export function totalPaymasterEthFees(fees: PaymasterFeeParts): Decimal {
  return fees.activation;
}
