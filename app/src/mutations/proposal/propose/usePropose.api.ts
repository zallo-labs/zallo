import { gql } from '@apollo/client';
import { hexlify } from 'ethers/lib/utils';
import { hashTx, QuorumGuid, toTx, TxOptions } from 'lib';
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
import { ProposalId } from '~/queries/proposal';
import { useCredentials } from '@network/useCredentials';

gql`
  ${TransactionFieldsFragmentDoc}

  mutation Propose(
    $account: Address!
    $quorumKey: QuorumKey
    $to: Address!
    $value: Uint256
    $data: Bytes
    $salt: Bytes8
    $gasLimit: Uint256
  ) {
    propose(
      account: $account
      quorumKey: $quorumKey
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

export const useApiPropose = () => {
  const credentials = useCredentials();
  const [mutation] = useProposeMutation();

  const propose = useCallback(
    async (txOpts: TxOptions, quorum: QuorumGuid): Promise<ProposeResponse> => {
      const tx = toTx(txOpts);
      const id = await hashTx(tx, { address: quorum.account, provider: credentials.provider });

      const createdAt = DateTime.now().toISO();

      const res = await mutation({
        variables: {
          account: quorum.account,
          quorumKey: quorum.key,
          to: tx.to,
          value: tx.value?.toString(),
          data: tx.data ? hexlify(tx.data) : undefined,
          salt: tx.salt,
          gasLimit: txOpts.gasLimit?.toString(),
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
              variables: { id },
              data: {
                proposal: {
                  id,
                  accountId: quorum.account,
                  quorumKey: quorum.key,
                  proposerId: credentials.address,
                  to: tx.to,
                  value: tx.value?.toString(),
                  data: tx.data ? hexlify(tx.data) : undefined,
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
                const i = data.proposals.findIndex((p) => p.id === id);
                data.proposals[i >= 0 ? i : data.proposals.length] = {
                  id,
                  accountId: quorum.account,
                  createdAt,
                };
              },
            });
          }
        },
      });

      const submissionHash = res.data?.propose?.transactions
        ? res.data.propose.transactions[res.data.propose.transactions.length - 1].hash
        : undefined;

      return { id, submissionHash };
    },
    [credentials.provider, credentials.address, mutation],
  );

  return propose;
};
