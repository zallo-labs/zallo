import { Tx } from 'lib';
import { useCallback, useState } from 'react';
import { RootNavigation, useRootNavigation } from '~/navigation/useRootNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { asProposalId, ProposalId } from '~/gql/api/proposal/types';
import { OnExecute } from '~/screens/proposal/ProposalActions';
import { O } from 'ts-toolbelt';
import { ProposalFieldsFragmentDoc, useProposeMutation } from '@api/generated';
import assert from 'assert';
import { gql } from '@apollo/client';
import { AccountIdlike, asAccountId } from '@api/account';

gql`
  ${ProposalFieldsFragmentDoc}

  mutation Propose(
    $account: Address!
    $to: Address!
    $value: Uint256
    $data: Bytes
    $nonce: Uint256
    $gasLimit: Uint256
  ) {
    propose(
      account: $account
      to: $to
      value: $value
      data: $data
      nonce: $nonce
      gasLimit: $gasLimit
    ) {
      ...ProposalFields
    }
  }
`;

export type TxOptions = O.Optional<Tx, 'nonce'>;

export interface ProposeResponse {
  id: ProposalId;
}

export type OnPropose = (
  proposal: ProposeResponse,
  navigation: RootNavigation,
) => Promise<void> | void;

export const usePropose = () => {
  const [mutation] = useProposeMutation();
  const navigation = useRootNavigation();

  const [proposing, setProposing] = useState(false);

  const propose = useCallback(
    async (tx: TxOptions, account: AccountIdlike): Promise<ProposeResponse> => {
      const r = await mutation({
        variables: {
          account: asAccountId(account),
          to: tx.to,
          value: tx.value?.toString(),
          data: tx.data,
          gasLimit: tx.gasLimit?.toString(),
        },
        // TODO: cache update - insert into Proposals
      });

      assert(r.data?.propose, 'Proposal failed');
      return { id: asProposalId(r.data.propose.id) };
    },
    [mutation],
  );

  const p = useCallback(
    async (txOpts: TxOptions, account: AccountIdlike, onPropose?: OnPropose) => {
      setProposing(true);

      const proposal = await propose(txOpts, account);

      await onPropose?.(proposal, navigation);
      setProposing(false);

      return proposal;
    },
    [navigation, propose],
  );

  return [p, proposing] as const;
};

export const popToProposal = (
  proposal: ProposalId,
  navigation: RootNavigation,
  onExecute?: OnExecute,
) => navigation.replace('Proposal', { proposal, onExecute });

export const showProposalSnack = (...params: Parameters<typeof popToProposal>) => {
  showInfo('Proposal created', {
    action: {
      label: 'View proposal',
      onPress: () => popToProposal(...params),
    },
    visibilityTime: 8000,
  });
};
