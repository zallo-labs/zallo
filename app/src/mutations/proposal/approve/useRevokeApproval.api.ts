import { gql } from '@apollo/client';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  useRevokeApprovalMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { useCallback } from 'react';
import { useDevice } from '@network/useDevice';
import { Proposal } from '~/queries/proposal';
import produce from 'immer';
import { QueryOpts } from '~/gql/update';

gql`
  mutation RevokeApproval($hash: Bytes32!) {
    revokeApproval(hash: $hash) {
      id
    }
  }
`;

export const useRevokeApproval = () => {
  const device = useDevice();

  const [mutation] = useRevokeApprovalMutation({ client: useApiClient() });

  const revoke = useCallback(
    ({ id, hash }: Proposal) =>
      mutation({
        variables: {
          hash,
        },
        optimisticResponse: {
          revokeApproval: {
            id,
          },
        },
        update: async (cache, res) => {
          if (!res?.data?.revokeApproval.id) return;

          const shouldRemove = await updateOrRemoveProposal();
          if (shouldRemove) removeProposalFromProposalsMetadata();

          async function updateOrRemoveProposal() {
            const opts: QueryOpts<ProposalQueryVariables> = {
              query: ProposalDocument,
              variables: { hash },
            };

            const data = cache.readQuery<ProposalQuery>(opts);
            if (!data) return false;

            const shouldRemove =
              !data.proposal.approvals || data.proposal.approvals.length === 1;

            if (shouldRemove) {
              cache.evict({
                id: cache.identify({
                  __typename: 'Proposal',
                  id,
                }),
              });
            } else {
              cache.writeQuery<ProposalQuery>({
                ...opts,
                overwrite: true,
                data: produce(data, (data) => {
                  data.proposal.approvals = data.proposal.approvals?.filter(
                    (a) => a.deviceId !== device.address,
                  );
                }),
              });
            }

            return shouldRemove;
          }

          async function removeProposalFromProposalsMetadata() {
            const opts: QueryOpts<ProposalsMetadataQueryVariables> = {
              query: ProposalsMetadataDocument,
              variables: {},
            };

            const data = cache.readQuery<ProposalsMetadataQuery>(opts);
            if (!data) return;

            cache.writeQuery<ProposalsMetadataQuery>({
              ...opts,
              overwrite: true,
              data: produce(data, (data) => {
                data.proposals = data.proposals?.filter((p) => p.hash !== hash);
              }),
            });
          }
        },
      }),
    [mutation, device.address],
  );

  return revoke;
};
