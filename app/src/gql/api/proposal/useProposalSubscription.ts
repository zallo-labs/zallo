import { gql } from '@apollo/client';
import {
  ProposalFieldsFragment,
  ProposalFieldsFragmentDoc,
  useProposalSubscriptionSubscription,
} from '@api/generated';
import { EventEmitter } from '~/util/EventEmitter';
import assert from 'assert';

export const PROPOSAL_EXECUTE_EMITTER = new EventEmitter<ProposalFieldsFragment>(
  'Proposal::exeucte',
);

gql`
  ${ProposalFieldsFragmentDoc}

  subscription ProposalSubscription(
    $accounts: [Address!]
    $proposals: [Bytes32!]
    $events: [ProposalEvent!]
  ) {
    proposal(accounts: $accounts, proposals: $proposals, events: $events) {
      ...ProposalFields
    }
  }
`;

export const useProposalSubscription = useProposalSubscriptionSubscription;

export const useEmitProposalExecutionEvents = (
  params: Parameters<typeof useProposalSubscription>[0],
) =>
  useProposalSubscription({
    ...params,
    variables: { ...params?.variables, events: 'execute' },
    onData: ({ data }) => {
      assert(data.data);
      PROPOSAL_EXECUTE_EMITTER.emit(data.data.proposal);
    },
  });
