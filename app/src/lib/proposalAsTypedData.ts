import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import Decimal from 'decimal.js';
import { Operation, asAddress, asFp, asTypedData } from 'lib';

const Transaction = gql(/* GraphQL */ `
  fragment proposalAsTypedData_Transaction on Transaction {
    id
    account {
      id
      address
    }
    operations {
      to
      value
      data
    }
    timestamp
    gasLimit
    feeToken {
      id
      address
      decimals
    }
    maxAmount
    paymaster
  }
`);

export function proposalAsTypedData(proposalFragment: FragmentType<typeof Transaction>) {
  const p = getFragment(Transaction, proposalFragment);

  return asTypedData(p.account.address, {
    operations: p.operations.map(
      (op): Operation => ({
        to: op.to,
        value: op.value ? BigInt(op.value) : undefined,
        data: op.data || undefined,
      }),
    ) as [Operation, ...Operation[]],
    timestamp: BigInt(Math.floor(new Date(p.timestamp).getTime() / 1000)),
    gas: BigInt(p.gasLimit),
    feeToken: asAddress(p.feeToken.address),
    maxAmount: asFp(new Decimal(p.maxAmount), p.feeToken.decimals),
    paymaster: asAddress(p.paymaster),
  });
}
