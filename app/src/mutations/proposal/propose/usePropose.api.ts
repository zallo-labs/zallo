import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useApiClient } from '~/gql/GqlProvider';
import { hexlify } from 'ethers/lib/utils';
import { Address, createTx, getTxId, hashTx, TxDef } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
  ProposalsMetadataDocument,
  ProposalsMetadataQuery,
  ProposalsMetadataQueryVariables,
  TransactionFieldsFragmentDoc,
  useProposeMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { BigNumberish } from 'ethers';
import { ProposalId } from '~/queries/proposal';

gql`
  ${TransactionFieldsFragmentDoc}

  mutation Propose(
    $account: Address!
    $config: Float
    $to: Address!
    $value: Uint256
    $data: Bytes
    $salt: Bytes8
    $gasLimit: Uint256
  ) {
    propose(
      account: $account
      config: $config
      to: $to
      value: $value
      data: $data
      salt: $salt
      gasLimit: $gasLimit
    ) {
      id
      transactions {
        ...TransactionFields
      }
    }
  }
`;

export interface ProposeResponse extends ProposalId {
  submissionHash?: string;
}

export interface ProposalDef extends TxDef {
  gasLimit?: BigNumberish;
}

export const useApiPropose = () => {
  const device = useDevice();
  const [mutation] = useProposeMutation({ client: useApiClient() });

  const propose = useCallback(
    async (txDef: ProposalDef, account: Address): Promise<ProposeResponse> => {
      const tx = createTx(txDef);
      const hash = await hashTx({ address: account, provider: device.provider, tx });

      const id = getTxId(hash);
      const createdAt = DateTime.now().toISO();
      // const signature = await signTx(device, account, tx);

      const res = await mutation({
        variables: {
          account,
          to: tx.to,
          value: tx.value.toString(),
          data: hexlify(tx.data),
          salt: hexlify(tx.salt),
          gasLimit: txDef.gasLimit?.toString(),
        },
        optimisticResponse: {
          propose: {
            id,
            transactions: null,
          },
        },
        update: async (cache, res) => {
          if (!res?.data?.propose.id) return;
          const transactions = res.data.propose.transactions;

          await upsertProposal();
          upsertProposalsMetadata();

          async function upsertProposal() {
            cache.writeQuery<ProposalQuery, ProposalQueryVariables>({
              query: ProposalDocument,
              variables: { id: hash },
              data: {
                proposal: {
                  id,
                  accountId: account,
                  proposerId: device.address,
                  to: tx.to,
                  value: tx.value.toString(),
                  data: hexlify(tx.data),
                  salt: hexlify(tx.salt),
                  createdAt,
                  approvals: [],
                  transactions,
                },
              },
            });
          }

          async function upsertProposalsMetadata() {
            updateQuery<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>({
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

      const submissionHash = res.data?.propose?.transactions
        ? res.data.propose.transactions[res.data.propose.transactions.length - 1].hash
        : undefined;

      return { hash, submissionHash };
    },
    [device, mutation],
  );

  return propose;
};
