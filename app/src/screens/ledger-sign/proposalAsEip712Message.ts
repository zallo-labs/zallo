import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { ethers } from 'ethers';
import {
  Operation,
  TX_EIP712_TYPES,
  asBigInt,
  getAccountTypedDataDomain,
  getTransactionTypedDataMessage,
} from 'lib';
import { EIP712Message } from '@ledgerhq/types-live';

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

export function proposalAsEip712Message(
  proposalFragment: FragmentType<typeof TransactionProposal>,
): EIP712Message {
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
