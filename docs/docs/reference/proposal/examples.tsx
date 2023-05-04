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
        mutation Propose($account: Address!, $to: Address!, $value: Uint256, $data: Bytes) {
          propose(account: $account, to: $to, value: $value, data: $data) {
            id
            to
            value
            data
          }
        }
      `}
      variables={
        {
          account,
          to: device,
          value: 3000000,
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
        mutation Approve($id: Bytes32!, $signature: Bytes!) {
          approve(id: $id, signature: $signature) {
            id
            to
            value
            data
          }
        }
      `}
      variables={
        { id: proposal, signature: signDigest(proposal, device) } as ApproveMutationVariables
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
            transaction {
              hash
              gasLimit
              gasPrice
              createdAt
              receipt {
                success
                response
                timestamp
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
        query Proposal($id: Bytes32!) {
          proposal(id: $id) {
            id
            to
            value
            data
            transaction {
              hash
              gasLimit
              gasPrice
              createdAt
              receipt {
                success
                response
                timestamp
              }
            }
          }
        }
      `}
      variables={{ id: proposal } as ProposalQueryVariables}
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
            transaction {
              hash
              gasLimit
              gasPrice
              createdAt
              receipt {
                success
                response
                timestamp
              }
            }
          }
        }
      `}
      variables={{} as ProposalsQueryVariables}
    />
  );
});
