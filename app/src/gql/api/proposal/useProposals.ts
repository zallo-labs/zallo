import { gql } from '@apollo/client';
import { Address, Arraylike, toArray } from 'lib';
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
    $take: Int
    $cursor: ProposalWhereUniqueInput
  ) {
    proposals(accounts: $accounts, states: $states, take: $take, cursor: $cursor) {
      ...ProposalFields
    }
  }
`;

export type ProposalsOptions = {
  accounts?: Arraylike<Address>;
  take?: number;
  cursor?: ProposalId;
} & (
  | { states?: Arraylike<ProposalState>; requiresUserAction?: never }
  | { states?: Arraylike<Extract<ProposalState, 'Pending'>>; requiresUserAction?: boolean }
);

export const useProposals = ({
  accounts,
  states,
  take,
  cursor,
  requiresUserAction,
}: ProposalsOptions = {}) => {
  // Only pending states may require user action
  if (requiresUserAction) states = ['Pending'];

  const { data } = useSuspenseQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, {
    variables: {
      accounts,
      states: states ? toArray(states) : undefined,
      take,
      ...(cursor && { cursor: { id: cursor } }),
    },
  });

  return useMemo((): Proposal[] => {
    const proposals = data.proposals.map(toProposal);

    return requiresUserAction ? proposals.filter((p) => p.requiresUserAction) : proposals;
  }, [data.proposals, requiresUserAction]);
};
