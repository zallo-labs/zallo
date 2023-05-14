import { gql } from '@apollo/client';
import { Address, Arraylike, toArray } from 'lib';
import { useMemo } from 'react';
import {
  TransactionProposalFieldsFragmentDoc,
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  TransactionProposalStatus,
} from '@api/generated';
import { useSuspenseQuery } from '~/gql/util';
import { Proposal, toProposal } from './types';

gql`
  ${TransactionProposalFieldsFragmentDoc}

  query Proposals($input: ProposalsInput) {
    proposals(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export type ProposalsOptions = {
  accounts?: Arraylike<Address>;
} & (
  | { statuses?: Arraylike<TransactionProposalStatus>; requiresUserAction?: never }
  | {
      statuses?: Arraylike<Extract<TransactionProposalStatus, 'Pending'>>;
      requiresUserAction?: boolean;
    }
);

export const useProposals = ({ accounts, statuses, requiresUserAction }: ProposalsOptions = {}) => {
  // Only pending states may require user action
  if (requiresUserAction) statuses = ['Pending'];

  const { data } = useSuspenseQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, {
    variables: {
      input: {
        accounts: accounts ? toArray(accounts) : undefined,
        statuses: statuses ? toArray(statuses) : undefined,
      },
    },
  });

  return useMemo((): Proposal[] => {
    const proposals = data.proposals.map(toProposal);

    return requiresUserAction ? proposals.filter((p) => p.requiresUserAction) : proposals;
  }, [data.proposals, requiresUserAction]);
};
