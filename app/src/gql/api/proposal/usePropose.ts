import { Hex, MaybePromise, Tx } from 'lib';
import { useCallback } from 'react';
import { StackNavigation, useStackNavigation } from '~/navigation/useStackNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { ProposalId } from './types';
import { O } from 'ts-toolbelt';
import {
  TransactionProposalFieldsFragmentDoc,
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  useProposeMutation,
  ProposeInput,
} from '@api/generated';
import { gql } from '@apollo/client';
import { AccountIdlike } from '@api/account';
import { updateQuery } from '~/gql/util';

gql`
  ${TransactionProposalFieldsFragmentDoc}

  mutation Propose($input: ProposeInput!) {
    propose(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export interface ProposeOptions extends O.Optional<Tx, 'nonce'> {
  account: AccountIdlike;
}

export type TxOptions = O.Optional<Tx, 'nonce'>;

export type OnPropose = (proposal: ProposalId, navigation: StackNavigation) => Promise<void> | void;

export const usePropose = () => {
  const [mutation] = useProposeMutation();
  const navigation = useStackNavigation();

  return useCallback(
    async (input: ProposeInput, onPropose?: OnPropose) => {
      const r = await mutation({
        variables: { input },
        update: async (cache, { data }) => {
          const proposal = data?.propose;
          if (!proposal) return;

          // TODO: update all relevant variants based on appropriate query variables
          await updateQuery<ProposalsQuery, ProposalsQueryVariables>({
            query: ProposalsDocument,
            cache,
            defaultData: { proposals: [] },
            updater: (data) => {
              data.proposals.push(proposal);
            },
          });
        },
      });

      const hash = r.data?.propose?.hash as ProposalId | undefined;
      if (!hash) throw new Error('Proposal failed');

      await onPropose?.(hash, navigation);

      return hash;
    },
    [navigation, mutation],
  );
};

export type OnExecute = (response: { transactionHash: Hex }) => MaybePromise<void>;

export const popToProposal = (proposal: ProposalId, navigation: StackNavigation) =>
  navigation.replace('Proposal', { proposal });

export const showProposalSnack = (...params: Parameters<typeof popToProposal>) => {
  showInfo('Proposal created', {
    action: {
      label: 'View proposal',
      onPress: () => popToProposal(...params),
    },
    visibilityTime: 8000,
  });
};
