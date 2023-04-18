import { Injectable } from '@nestjs/common';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import fetch from 'cross-fetch';
import { CONFIG } from '~/config';
import {
  TransactionResponseQuery,
  TransactionResponseQueryVariables,
} from '@gen/generated.subgraph';
import { TRANSACTION_RESPONSES_QUERY } from './subgraph.gql';

export type SubgraphTransactionResponse = NonNullable<TransactionResponseQuery['transaction']>;

@Injectable()
export class SubgraphService {
  private client = new ApolloClient({
    link: ApolloLink.from([
      new RetryLink(),
      new HttpLink({
        uri: CONFIG.subgraphGqlUrl,
        fetch,
      }),
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: 'no-cache' },
      watchQuery: { fetchPolicy: 'no-cache' },
      mutate: { fetchPolicy: 'no-cache' },
    },
  });

  async transactionResponse(
    transactionHash: string,
  ): Promise<SubgraphTransactionResponse | undefined> {
    const { data } = await this.client.query<
      TransactionResponseQuery,
      TransactionResponseQueryVariables
    >({
      query: TRANSACTION_RESPONSES_QUERY,
      variables: { transactionHash },
    });

    return data.transaction ?? undefined;
  }
}
