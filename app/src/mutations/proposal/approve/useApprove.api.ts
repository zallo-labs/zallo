import { gql } from '@apollo/client';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import assert from 'assert';
import produce from 'immer';
import { signTx } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { Proposal } from '~/queries/proposal';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  useApproveMutation,
  TransactionFieldsFragmentDoc,
} from '~/gql/generated.api';
import { useCredentials } from '@network/useCredentials';

gql`
  ${TransactionFieldsFragmentDoc}

  mutation Approve($id: Bytes32!, $signature: Bytes!) {
    approve(id: $id, signature: $signature) {
      id
      transactions {
        ...TransactionFields
      }
    }
  }
`;

export const useApprove = () => {
  const credentials = useCredentials();
  const [mutate] = useApproveMutation({ client: useApiClient() });

  const approve = useCallback(
    async (p: Proposal) => {
      const signature = await signTx(credentials, p.account, p);

      const res = await mutate({
        variables: {
          id: p.id,
          signature,
        },
        optimisticResponse: {
          approve: {
            id: p.id,
            transactions: null,
          },
        },
        update: (cache, res) => {
          if (!res?.data?.approve.id) return;
          const transactions = res.data.approve.transactions;

          // Proposal: add approval and update submissions
          const opts: QueryOpts<ProposalQueryVariables> = {
            query: ProposalDocument,
            variables: { id: p.id },
          };

          const data = cache.readQuery<ProposalQuery>(opts);
          assert(data);

          cache.writeQuery<ProposalQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              data.proposal!.approvals = [
                ...(data.proposal!.approvals ?? []),
                {
                  userId: credentials.address,
                  signature,
                  createdAt: DateTime.now().toISO(),
                },
              ];
              data.proposal!.transactions = transactions;
            }),
          });
        },
      });

      const submissionHash = res.data?.approve.transactions
        ? res.data.approve.transactions[res.data.approve.transactions.length - 1].hash
        : undefined;

      return { submissionHash };
    },
    [credentials, mutate],
  );

  return approve;
};
