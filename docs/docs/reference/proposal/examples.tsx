import React from 'react';
import gql from 'graphql-tag';
import Explorer from '@site/src/components/Explorer';
import {
  ProposeMutationVariables,
  ApproveMutationVariables,
  ProposalQueryVariables,
  ProposalsQueryVariables,
} from '@site/src/api.generated';
import { useAccount } from '@site/src/api/useAccount';
import { useDevice } from '@site/src/hooks/useDevice';
import { useProposal } from '@site/src/api/useProposal';
import { signProposal } from 'lib';
import { Suspend } from '@site/src/components/Suspender';

export const ProposeExample = () => {
  const device = useDevice().address;
  const account = useAccount();

  if (!account) return <Suspend />;

  return (
    <Explorer
      document={gql`
        mutation Propose(
          $account: Address!
          $config: Float
          $to: Address!
          $value: Uint256
          $data: Bytes
        ) {
          propose(account: $account, config: $config, to: $to, value: $value, data: $data) {
            id
            to
            value
            data
            salt
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
};

export const ApproveExample = () => {
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
        { id: proposal, signature: signProposal(proposal, device) } as ApproveMutationVariables
      }
    />
  );
};

export const ProposalExample = () => {
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
              response {
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
};

export const ProposalsExample = () => {
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
              response {
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
};
