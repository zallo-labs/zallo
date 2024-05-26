import Decimal from 'decimal.js';
import { PaymasterFeeParts } from './paymasters.model';

export function totalPaymasterEthFees(fees: PaymasterFeeParts): Decimal {
  return fees.activation;
}

export function lowerOfPaymasterFees(
  x: PaymasterFeeParts,
  y: PaymasterFeeParts,
): PaymasterFeeParts {
  return {
    activation: Decimal.min(x.activation, y.activation),
  };
}

export function paymasterFeesEq(x: PaymasterFeeParts, y: PaymasterFeeParts) {
  return x.activation.eq(y.activation);
}
