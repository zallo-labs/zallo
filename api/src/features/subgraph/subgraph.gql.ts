import { gql } from '@apollo/client';

export const TX_RESPONSES_QUERY = gql`
  query TxResponse($transactionHash: ID!) {
    tx(id: $transactionHash) {
      id
      success
      response
      executor
      blockHash
      timestamp
      transfers {
        id
        token
        type
        from
        to
        value
        blockHash
        timestamp
      }
    }
  }
`;
