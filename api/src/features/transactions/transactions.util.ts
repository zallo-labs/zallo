import Decimal from 'decimal.js';
import { Operation, asAddress, asHex, asTx } from 'lib';
import e, { $infer } from '~/edgeql-js';
import { Shape } from '../database/database.select';

export const TX_SHAPE = {
  operations: {
    to: true,
    value: true,
    data: true,
  },
  nonce: true,
  gasLimit: true,
  paymaster: true,
  maxPaymasterEthFees: { total: true },
  feeToken: { address: true },
} satisfies Shape<typeof e.Transaction>;

const s = e.select(e.Transaction, () => TX_SHAPE);
export type ProposalTxShape = NonNullable<$infer<typeof s>>[0];

export const transactionAsTx = (p: ProposalTxShape) =>
  asTx({
    operations: p.operations.map(
      (op): Operation => ({
        to: asAddress(op.to),
        value: op.value ?? undefined,
        data: asHex(op.data),
      }),
    ) as [Operation, ...Operation[]],
    nonce: p.nonce,
    gas: p.gasLimit,
    paymaster: asAddress(p.paymaster),
    paymasterEthFee: new Decimal(p.maxPaymasterEthFees.total),
    feeToken: asAddress(p.feeToken.address),
  });
