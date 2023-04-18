import { gql } from '@apollo/client';
import { Address, Arraylike, toArray } from 'lib';
import {
  ProposalEvent,
  ProposalFieldsFragmentDoc,
  useProposalSubscriptionSubscription,
} from '@api/generated';
import { ProposalId } from './types';

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

export interface ProposalSubscriptionOptions {
  accounts?: Arraylike<Address>;
  proposals?: Arraylike<ProposalId>;
  events?: Arraylike<ProposalEvent>;
  skip?: boolean;
}

export const useProposalSubscription = ({
  accounts,
  proposals,
  events,
  skip,
}: ProposalSubscriptionOptions = {}) =>
  useProposalSubscriptionSubscription({
    variables: {
      accounts: accounts ? toArray(accounts) : undefined,
      proposals: proposals ? toArray(proposals) : undefined,
      events: events ? toArray(events) : undefined,
    },
    skip,
  });
