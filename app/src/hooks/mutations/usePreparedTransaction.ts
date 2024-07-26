import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { usePreparedTransaction_account$key } from '~/api/__generated__/usePreparedTransaction_account.graphql';
import { useProposeTransaction } from './useProposeTransaction';
import { useLazyQuery } from '~/api';
import {
  PrepareTransactionInput,
  usePreparedTransactionQuery,
} from '~/api/__generated__/usePreparedTransactionQuery.graphql';
import { ProposeTransactionInput } from '~/api/__generated__/useProposeTransactionMutation.graphql';
import { asAddress } from 'lib';

const Query = graphql`
  query usePreparedTransactionQuery(
    $input: PrepareTransactionInput = {
      account: "zksync:0x0000000000000000000000000000000000000000"
      operations: []
    }
    $include: Boolean = false
  ) {
    prepareTransaction(input: $input) @include(if: $include) {
      id
      hash
      timestamp
      gasLimit
      feeToken {
        address
      }
      maxAmount
    }
  }
`;

const Account = graphql`
  fragment usePreparedTransaction_account on Account {
    address
    ...useProposeTransaction_account
  }
`;

export interface PrepapredTransactionParams {
  account: usePreparedTransaction_account$key;
  input: Omit<PrepareTransactionInput, 'account'> | undefined;
}

export function usePreparedTransaction(params: PrepapredTransactionParams) {
  const account = useFragment(Account, params.account);
  const propose = useProposeTransaction();

  const { prepareTransaction } = useLazyQuery<usePreparedTransactionQuery>(
    Query,
    {
      ...(params.input && {
        input: { ...params.input, account: account.address },
        include: true,
      }),
    },
    { fetchPolicy: 'store-and-network' },
  );

  return (input: Omit<ProposeTransactionInput, 'account'>) =>
    propose(account, {
      ...input,
      ...(prepareTransaction && {
        gas: prepareTransaction.gasLimit,
        feeToken: asAddress(prepareTransaction.feeToken.address),
        timestamp: prepareTransaction.timestamp,
      }),
    });
}
