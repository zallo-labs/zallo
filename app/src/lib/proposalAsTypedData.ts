import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import Decimal from 'decimal.js';
import { Operation, asAddress, asTypedData } from 'lib';

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
    nonce
    gasLimit
    feeToken {
      id
      address
    }
    paymaster
    maxPaymasterEthFees {
      total
    }
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
    nonce: BigInt(p.nonce),
    gas: BigInt(p.gasLimit),
    feeToken: asAddress(p.feeToken.address),
    paymaster: asAddress(p.paymaster),
    paymasterEthFee: new Decimal(p.maxPaymasterEthFees.total),
  });
}
