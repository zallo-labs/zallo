import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useApiClient } from '~/gql/GqlProvider';
import { QueryOpts } from '~/gql/update';
import assert from 'assert';
import produce from 'immer';
import { getTxId, signTx } from 'lib';
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
  const device = useDevice();

  const [mutate] = useApproveMutation({ client: useApiClient() });

  const approve = useCallback(
    async (p: Proposal) => {
      const signature = await signTx(device, p.account, p);

      const res = await mutate({
        variables: {
          id: p.hash,
          signature,
        },
        optimisticResponse: {
          approve: {
            id: getTxId(p.hash),
            transactions: null,
          },
        },
        update: (cache, res) => {
          if (!res?.data?.approve.id) return;
          const transactions = res.data.approve.transactions;

          // Proposal: add approval and update submissions
          const opts: QueryOpts<ProposalQueryVariables> = {
            query: ProposalDocument,
            variables: { id: p.hash },
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
                  deviceId: device.address,
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
    [mutate, device],
  );

  return approve;
};
