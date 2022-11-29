import React from 'react';
import gql from 'graphql-tag';
import Explorer from '@site/src/components/Explorer';
import { ProposeMutationVariables, ApproveMutationVariables } from '@site/src/api.generated';

export const ProposeExample = () => (
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
        account: '0x0000000000000000000000000000000000000000',
        to: '0x0000000000000000000000000000000000000000',
        value: '3000000',
      } as ProposeMutationVariables
    }
  />
);

export const ApproveExample = () => (
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
      {
        id: '0x0000000000000000000000000000000000000000000000000000000000000000',
        signature: '0x0000000000000000000000000000000000000000000000000000000000000000',
      } as ApproveMutationVariables
    }
  />
);

export const ProposalExample = () => (
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
    variables={
      {
        id: '0x0000000000000000000000000000000000000000000000000000000000000000',
        signature: '0x0000000000000000000000000000000000000000000000000000000000000000',
      } as ApproveMutationVariables
    }
  />
);

export const ProposalsExample = () => (
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
    variables={
      {
        id: '0x0000000000000000000000000000000000000000000000000000000000000000',
        signature: '0x0000000000000000000000000000000000000000000000000000000000000000',
      } as ApproveMutationVariables
    }
  />
);
