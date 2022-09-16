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
} from '~/gql/generated.api';

gql`
  mutation Approve($hash: Bytes32!, $signature: Bytes!) {
    approve(hash: $hash, signature: $signature) {
      id
    }
  }
`;

export const useApprove = () => {
  const device = useDevice();

  const [mutate] = useApproveMutation({ client: useApiClient() });

  const approve = useCallback(
    async (p: Proposal) => {
      const signature = await signTx(device, p.account, p);

      return await mutate({
        variables: {
          hash: p.hash,
          signature,
        },
        optimisticResponse: {
          approve: {
            id: getTxId(p.hash),
          },
        },
        update: (cache, res) => {
          if (!res?.data?.approve.id) return;

          // Proposal: add approval
          const opts: QueryOpts<ProposalQueryVariables> = {
            query: ProposalDocument,
            variables: { hash: p.hash },
          };

          const data = cache.readQuery<ProposalQuery>(opts);
          assert(data);

          cache.writeQuery<ProposalQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              data.proposal.approvals = [
                ...(data.proposal.approvals ?? []),
                {
                  deviceId: device.address,
                  signature,
                  createdAt: DateTime.now().toISO(),
                },
              ];
            }),
          });
        },
      });
    },
    [mutate, device],
  );

  return approve;
};
