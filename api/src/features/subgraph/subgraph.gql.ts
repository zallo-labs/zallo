import { gql } from '@apollo/client';

export const TRANSACTION_RESPONSES_QUERY = gql`
  query TransactionResponse($transactionHash: ID!) {
    transaction(id: $transactionHash) {
      id
      success
      response
      executor
      blockHash
      timestamp
    }
  }
`;
