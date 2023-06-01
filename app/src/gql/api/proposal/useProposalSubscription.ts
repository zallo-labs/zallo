import { gql } from '@apollo/client';
import {
  ProposalSubscriptionInput,
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  TransactionProposalFieldsFragment,
  TransactionProposalFieldsFragmentDoc,
  useProposalSubscriptionSubscription,
} from '@api/generated';
import { EventEmitter } from '~/util/EventEmitter';
import assert from 'assert';
import { updateQuery } from '~/gql/util';

export const PROPOSAL_EXECUTE_EMITTER = new EventEmitter<TransactionProposalFieldsFragment>(
  'Proposal::exeucte',
);

gql`
  ${TransactionProposalFieldsFragmentDoc}

  subscription ProposalSubscription($input: ProposalSubscriptionInput) {
    proposal(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export const useProposalSubscription = (
  opts?: Parameters<typeof useProposalSubscriptionSubscription>[0],
) =>
  useProposalSubscriptionSubscription({
    onData: ({ client: { cache }, data: { data } }) => {
      const proposal = data?.proposal;
      if (!proposal) return;

      updateQuery<ProposalsQuery, ProposalsQueryVariables>({
        query: ProposalsDocument,
        variables: { input: { accounts: [proposal.account.address] } },
        cache,
        defaultData: { proposals: [] },
        updater: (data) => {
          if (!data.proposals.find((p) => p.id === proposal.id)) data.proposals.push(proposal);
        },
      });
    },
    ...opts,
  });

export const useEmitProposalExecutionEvents = (input: Partial<ProposalSubscriptionInput> = {}) =>
  useProposalSubscription({
    variables: {
      input: {
        events: ['executed'],
        ...input,
      },
    },
    onData: ({ data }) => {
      assert(data.data);
      PROPOSAL_EXECUTE_EMITTER.emit(data.data.proposal);
    },
  });
