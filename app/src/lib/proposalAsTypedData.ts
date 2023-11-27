import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { Operation, asTypedData } from 'lib';

const TransactionProposal = gql(/* GraphQL */ `
  fragment proposalAsTypedData_TransactionProposal on TransactionProposal {
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
  }
`);

export function proposalAsTypedData(proposalFragment: FragmentType<typeof TransactionProposal>) {
  const p = getFragment(TransactionProposal, proposalFragment);

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
  });
}
