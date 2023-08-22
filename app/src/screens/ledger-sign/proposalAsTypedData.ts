import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { ethers } from 'ethers';
import {
  Operation,
  TX_EIP712_TYPES,
  asBigInt,
  getAccountTypedDataDomain,
  getTransactionTypedDataMessage,
} from 'lib';
import { TypedDataDefinition } from 'viem';

const TransactionProposal = gql(/* GraphQL */ `
  fragment ProposalAsEip712Message_TransactionProposal on TransactionProposal {
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

export function proposalAsTypedData(
  proposalFragment: FragmentType<typeof TransactionProposal>,
): TypedDataDefinition {
  const p = getFragment(TransactionProposal, proposalFragment);

  return ethers.utils._TypedDataEncoder.getPayload(
    getAccountTypedDataDomain(p.account.address),
    TX_EIP712_TYPES,
    getTransactionTypedDataMessage(
      {
        operations: p.operations.map(
          (op): Operation => ({
            to: op.to,
            value: asBigInt(op.value),
            data: op.data || undefined,
          }),
        ) as [Operation, ...Operation[]],
        nonce: asBigInt(p.nonce),
        gasLimit: asBigInt(p.gasLimit),
      },
      p.account.address,
    ),
  );
}
