import React from 'react';
import gql from 'graphql-tag';
import Explorer from '@site/src/components/Explorer';
import {
  ProposeMutationVariables,
  ApproveMutationVariables,
  ProposalQueryVariables,
  ProposalsQueryVariables,
  ProposalChangesSubscriptionVariables,
} from '@site/src/api.generated';
import { useAccount } from '@site/src/api/useAccount';
import { useDevice } from '@site/src/hooks/useDevice';
import { useProposal } from '@site/src/api/useProposal';
import { Suspend } from '@site/src/components/Suspender';
import { withBrowser } from '@site/src/components/withBrowser';
import { signDigest } from 'lib';

export const ProposeExample = withBrowser(() => {
  const device = useDevice().address;
  const account = useAccount();

  if (!account) return <Suspend />;

  return (
    <Explorer
      document={gql`
        mutation Propose($input: ProposeInput!) {
          propose(input: $input) {
            id
            hash
            to
            value
            data
          }
        }
      `}
      variables={
        {
          input: {
            account,
            to: device,
            value: 3000000,
          },
        } as ProposeMutationVariables
      }
    />
  );
});

export const ApproveExample = withBrowser(() => {
  const proposal = useProposal();
  const device = useDevice();
  if (!proposal) return <Suspend />;

  return (
    <Explorer
      document={gql`
        mutation Approve($input: ApproveInput!) {
          approve(input: $input) {
            id
            hash
            to
            value
            data
          }
        }
      `}
      variables={
        {
          input: {
            hash: proposal,
            signature: signDigest(proposal, device),
          },
        } as ApproveMutationVariables
      }
    />
  );
});

export const SubscribeExample = withBrowser(() => {
  const proposal = useProposal();
  if (!proposal) return <Suspend />;

  return (
    <Explorer
      document={gql`
        subscription ProposalChanges {
          proposal {
            id
            to
            value
            data
            gasLimit
            transaction {
              hash
              gasPrice
              submittedAt
              receipt {
                success
                response
                timestamp
                gasUsed
                fee
              }
            }
          }
        }
      `}
      variables={{} as ProposalChangesSubscriptionVariables}
    />
  );
});

export const ProposalExample = withBrowser(() => {
  const proposal = useProposal();
  if (!proposal) return <Suspend />;

  return (
    <Explorer
      document={gql`
        query Proposal($input: ProposalInput!) {
          proposal(input: $input) {
            id
            to
            value
            data
            gasLimit
            transaction {
              hash
              gasPrice
              submittedAt
              receipt {
                success
                response
                timestamp
                gasUsed
                fee
              }
            }
          }
        }
      `}
      variables={{ input: { hash: proposal } } as ProposalQueryVariables}
    />
  );
});

export const ProposalsExample = withBrowser(() => {
  if (!useProposal()) return <Suspend />;

  return (
    <Explorer
      document={gql`
        query Proposals {
          proposals {
            id
            to
            value
            data
            gasLimit
            transaction {
              hash
              gasPrice
              submittedAt
              receipt {
                success
                response
                timestamp
                gasUsed
                fee
              }
            }
          }
        }
      `}
      variables={{} as ProposalsQueryVariables}
    />
  );
});
