import { gql, useSuspenseQuery } from '@apollo/client';
import { Address, Arraylike, toArray } from 'lib';
import { useMemo } from 'react';
import {
  TransactionProposalFieldsFragmentDoc,
  ProposalsDocument,
  ProposalsQuery,
  ProposalsQueryVariables,
  TransactionProposalStatus,
} from '@api/generated';
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
  accounts?: Address[];
} & (
  | { statuses?: Arraylike<TransactionProposalStatus>; responseRequested?: never }
  | {
      statuses?: Arraylike<Extract<TransactionProposalStatus, 'Pending'>>;
      responseRequested?: boolean;
    }
);

export const useProposals = ({ accounts, statuses, responseRequested }: ProposalsOptions) => {
  // Only pending states may require user action
  if (responseRequested) statuses = ['Pending'];

  const { data } = useSuspenseQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, {
    variables: {
      input: {
        accounts,
        statuses: statuses ? toArray(statuses) : undefined,
      },
    },
  });

  return useMemo((): Proposal[] => {
    const proposals = data.proposals.map(toProposal);

    return responseRequested ? proposals.filter((p) => p.policy?.responseRequested) : proposals;
  }, [data.proposals, responseRequested]);
};
