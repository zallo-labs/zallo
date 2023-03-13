import { gql } from '@apollo/client';
import { Address, Id, Arraylike, toArray } from 'lib';
import { useMemo } from 'react';
import {
  ProposalFieldsFragmentDoc,
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  ProposalState,
} from '@api/generated';
import { useSuspenseQuery } from '~/gql/util';
import { Proposal, ProposalId, toProposal } from './types';

gql`
  ${ProposalFieldsFragmentDoc}

  query Proposals(
    $accounts: [Address!]
    $states: [ProposalState!]
    $actionRequired: Boolean
    $take: Int
    $cursor: ProposalWhereUniqueInput
  ) {
    proposals(
      accounts: $accounts
      states: $states
      actionRequired: $actionRequired
      take: $take
      cursor: $cursor
    ) {
      ...ProposalFields
    }
  }
`;

export interface ProposalsOptions {
  accounts?: Arraylike<Address>;
  states?: Arraylike<ProposalState>;
  actionRequired?: boolean;
  take?: number;
  cursor?: ProposalId;
}

export const useProposals = ({
  accounts,
  states,
  actionRequired,
  take,
  cursor,
}: ProposalsOptions = {}) => {
  const { data } = useSuspenseQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, {
    variables: {
      accounts,
      states: states ? toArray(states) : undefined,
      actionRequired,
      take,
      cursor: { id: cursor },
    },
  });

  return useMemo((): Proposal[] => data.proposals.map(toProposal), [data.proposals]);
};
