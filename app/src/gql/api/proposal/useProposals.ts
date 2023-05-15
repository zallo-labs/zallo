import { gql } from '@apollo/client';
import { Arraylike, toArray } from 'lib';
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
import { useSelectedAccount } from '~/components/AccountSelector/useSelectedAccount';

gql`
  ${TransactionProposalFieldsFragmentDoc}

  query Proposals($input: ProposalsInput) {
    proposals(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export type ProposalsOptions =
  | { statuses?: Arraylike<TransactionProposalStatus>; requiresUserAction?: never }
  | {
      statuses?: Arraylike<Extract<TransactionProposalStatus, 'Pending'>>;
      requiresUserAction?: boolean;
    };

export const useProposals = ({ statuses, requiresUserAction }: ProposalsOptions = {}) => {
  const selectedAccount = useSelectedAccount();

  // Only pending states may require user action
  if (requiresUserAction) statuses = ['Pending'];

  const { data } = useSuspenseQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, {
    variables: {
      input: {
        accounts: selectedAccount ? [selectedAccount] : undefined,
        statuses: statuses ? toArray(statuses) : undefined,
      },
    },
  });

  return useMemo((): Proposal[] => {
    const proposals = data.proposals.map(toProposal);

    return requiresUserAction ? proposals.filter((p) => p.requiresUserAction) : proposals;
  }, [data.proposals, requiresUserAction]);
};
