import { Hex, Operation, UUID, asAddress, asHex, asTx, isHex } from 'lib';
import e, { $infer, Set } from '~/edgeql-js';
import { Shape } from '~/core/database';
import { $uuid } from '~/edgeql-js/modules/std';
import { $ } from 'edgedb';

export const selectTransaction = (id: UUID | Hex) =>
  e.select(e.Transaction, () => ({ filter_single: isHex(id) ? { hash: id } : { id } }));

export const selectTransaction2 = (id: Set<$uuid, $.Cardinality.One>) =>
  e.select(e.Transaction, () => ({ filter_single: { id } }));

export const TX_SHAPE = {
  operations: {
    to: true,
    value: true,
    data: true,
  },
  timestamp: true,
  gasLimit: true,
  paymaster: true,
  feeToken: { address: true },
  maxAmountFp: true,
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
    timestamp: BigInt(Math.floor(p.timestamp.getTime() / 1000)),
    gas: p.gasLimit,
    paymaster: asAddress(p.paymaster),
    feeToken: asAddress(p.feeToken.address),
    maxAmount: p.maxAmountFp,
  });
