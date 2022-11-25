import { gql } from '@apollo/client';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  useRejectMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { useCallback } from 'react';
import { useDevice } from '@network/useDevice';
import { Proposal } from '~/queries/proposal';
import { updateQuery } from '~/gql/update';

gql`
  mutation Reject($id: Bytes32!) {
    reject(id: $id) {
      id
    }
  }
`;

export const useReject = () => {
  const device = useDevice();

  const [mutation] = useRejectMutation({ client: useApiClient() });

  const reject = useCallback(
    async ({ id, hash, approvals, userHasApproved }: Proposal) => {
      const r = await mutation({
        variables: {
          id: hash,
        },
        optimisticResponse: {
          reject: userHasApproved && approvals.length <= 1 ? null : { id },
        },
        update: async (cache, res) => {
          const proposalStillValid = !!res?.data?.reject?.id;

          if (proposalStillValid) {
            removeApprovalFromProposal();
          } else {
            removeProposal();
            removeProposalFromProposalsMetadata();
          }

          async function removeApprovalFromProposal() {
            updateQuery<ProposalQuery, ProposalQueryVariables>({
              cache,
              query: ProposalDocument,
              variables: { id: hash },
              updater: (data) => {
                data.proposal!.approvals = data.proposal!.approvals?.filter(
                  (a) => a.deviceId !== device.address,
                );
              },
            });
          }

          async function removeProposal() {
            cache.evict({
              id: cache.identify({
                __typename: 'Proposal',
                id,
              }),
            });
          }

          async function removeProposalFromProposalsMetadata() {
            updateQuery<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>({
              cache,
              query: ProposalsMetadataDocument,
              variables: {},
              updater: (data) => {
                data.proposals = data.proposals?.filter((p) => p.id !== hash);
              },
            });
          }
        },
      });

      return { removed: !r.data?.reject?.id };
    },
    [mutation, device.address],
  );

  return reject;
};
