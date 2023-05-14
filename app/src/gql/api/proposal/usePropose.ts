import { Hex, MaybePromise, Tx } from 'lib';
import { useCallback } from 'react';
import { StackNavigation, useStackNavigation } from '~/navigation/useStackNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { asProposalId, ProposalId } from './types';
import { O } from 'ts-toolbelt';
import {
  TransactionProposalFieldsFragmentDoc,
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  useProposeMutation,
} from '@api/generated';
import assert from 'assert';
import { gql } from '@apollo/client';
import { AccountIdlike, asAccountId } from '@api/account';
import { updateQuery } from '~/gql/util';
import { NavigationProp, useNavigation } from '@react-navigation/native';

gql`
  ${TransactionProposalFieldsFragmentDoc}

  mutation Propose($input: ProposeInput!) {
    propose(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export type TxOptions = O.Optional<Tx, 'nonce'>;

export type OnPropose = (proposal: ProposalId, navigation: StackNavigation) => Promise<void> | void;

export const usePropose = () => {
  const [mutation] = useProposeMutation();
  const navigation = useStackNavigation();

  const propose = useCallback(
    async (tx: TxOptions, account: AccountIdlike): Promise<ProposalId> => {
      const r = await mutation({
        variables: {
          input: {
            account: asAccountId(account),
            to: tx.to,
            value: tx.value?.toString(),
            data: tx.data,
            gasLimit: tx.gasLimit?.toString(),
          },
        },
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

      const proposal = r.data?.propose;
      if (!proposal) throw new Error('Proposal failed');

      return asProposalId(proposal.hash);
    },
    [mutation],
  );

  return useCallback(
    async (txOpts: TxOptions, account: AccountIdlike, onPropose?: OnPropose) => {
      const proposal = await propose(txOpts, account);
      await onPropose?.(proposal, navigation);

      return proposal;
    },
    [navigation, propose],
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
