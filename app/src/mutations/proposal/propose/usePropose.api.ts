import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useApiClient } from '~/gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { Address, createTx, getTxId, hashTx, signTx, TxDef } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  useProposeMutation,
} from '~/gql/generated.api';
import { QueryOpts, updateQuery } from '~/gql/update';
import produce from 'immer';

gql`
  mutation Propose(
    $account: Address!
    $proposal: ProposalInput!
    $signature: Bytes!
  ) {
    propose(account: $account, proposal: $proposal, signature: $signature) {
      id
    }
  }
`;

export const useApiPropose = () => {
  const device = useDevice();
  const [mutation] = useProposeMutation({ client: useApiClient() });

  const propose = useCallback(
    async (txDef: TxDef, account: Address) => {
      const tx = createTx(txDef);
      const hash = await hashTx(
        { address: account, provider: device.provider },
        tx,
      );

      const id = getTxId(hash);
      const createdAt = DateTime.now().toISO();
      const signature = await signTx(device, account, tx);

      await mutation({
        variables: {
          account,
          proposal: {
            to: tx.to,
            value: tx.value.toString(),
            data: hexlify(tx.data),
            salt: hexlify(tx.salt),
          },
          signature,
        },
        optimisticResponse: {
          propose: {
            id,
          },
        },
        update: async (cache, res) => {
          if (!res?.data?.propose.id) return;

          await upsertProposal();
          upsertProposalsMetadata();

          async function upsertProposal() {
            cache.writeQuery<ProposalQuery, ProposalQueryVariables>({
              query: ProposalDocument,
              variables: { hash },
              data: {
                proposal: {
                  id,
                  accountId: account,
                  proposerId: device.address,
                  hash,
                  to: tx.to,
                  value: tx.value.toString(),
                  data: hexlify(tx.data),
                  salt: hexlify(tx.salt),
                  createdAt,
                  approvals: [
                    {
                      deviceId: device.address,
                      signature,
                      createdAt,
                    },
                  ],
                  submissions: [],
                },
              },
            });
          }

          async function upsertProposalsMetadata() {
            updateQuery<
              ProposalsMetadataQuery,
              ProposalsMetadataQueryVariables
            >({
              cache,
              query: ProposalsMetadataDocument,
              variables: {},
              defaultData: { proposals: [] },
              updater: (data) => {
                const proposal = {
                  id,
                  accountId: account,
                  hash,
                  createdAt,
                };

                const i = data.proposals.findIndex((p) => p.id === id);
                if (i >= 0) {
                  data.proposals[i] = proposal;
                } else {
                  data.proposals.push(proposal);
                }
              },
            });
          }
        },
      });

      return { hash };
    },
    [device, mutation],
  );

  return propose;
};
