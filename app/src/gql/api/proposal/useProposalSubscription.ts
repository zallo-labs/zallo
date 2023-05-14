import { gql } from '@apollo/client';
import {
  ProposalSubscriptionInput,
  TransactionProposalFieldsFragment,
  TransactionProposalFieldsFragmentDoc,
  useProposalSubscriptionSubscription,
} from '@api/generated';
import { EventEmitter } from '~/util/EventEmitter';
import assert from 'assert';

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

export const useProposalSubscription = useProposalSubscriptionSubscription;

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
