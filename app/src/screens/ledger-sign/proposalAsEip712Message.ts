import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { PROVIDER } from '@network/provider';
import { ethers } from 'ethers';
import { Operation, TX_EIP712_TYPE, asBigInt, getDomain, getTransactionEip712Value } from 'lib';
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

export async function proposalAsEip712Message(
  proposalFragment: FragmentType<typeof TransactionProposal>,
): Promise<EIP712Message> {
  const p = getFragment(TransactionProposal, proposalFragment);

  return ethers.utils._TypedDataEncoder.getPayload(
    // Mainnet TODO: getDomain should accept a global address
    await getDomain({ address: p.account.address, provider: PROVIDER }),
    TX_EIP712_TYPE,
    await getTransactionEip712Value(
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
