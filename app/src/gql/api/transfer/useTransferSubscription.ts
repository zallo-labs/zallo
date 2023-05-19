import { gql } from '@apollo/client';
import { TRANSFER_FRAGMENT } from './useTransfers';
import {
  TransfersDocument,
  TransfersQuery,
  TransfersQueryVariables,
  useTransferSubscriptionSubscription,
} from '@api/generated';
import { useAccountIds } from '@api/account';
import { updateQuery } from '~/gql/util';

gql`
  ${TRANSFER_FRAGMENT}

  subscription TransferSubscription($input: TransferSubscriptionInput!) {
    transfer(input: $input) {
      ...TransferFragment
    }
  }
`;

export const useTransferSubscription = () => {
  const accounts = useAccountIds();

  return useTransferSubscriptionSubscription({
    variables: {
      input: {
        accounts,
        directions: ['In'],
      },
    },
    onData: ({ client: { cache }, data: { data } }) => {
      const transfer = data?.transfer;
      if (!transfer) return;

      updateQuery<TransfersQuery, TransfersQueryVariables>({
        query: TransfersDocument,
        cache,
        variables: {
          input: {
            accounts: [transfer.to],
            direction: 'In',
          },
        },
        defaultData: { transfers: [] },
        updater: (data) => {
          if (!data.transfers.some((t) => t.id === transfer.id)) data.transfers.push(transfer);
        },
      });
    },
  });
};
