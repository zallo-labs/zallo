import { Injectable } from '@nestjs/common';
import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import fetch from 'cross-fetch';
import { CONFIG } from 'config';
import {
  AccountRef,
  address,
  Address,
  filterFirst,
  toAccountRef,
  toId,
} from 'lib';
import {
  UserAccountsQuery,
  UserAccountsQueryVariables,
} from '@gen/generated.subgraph';

export interface SafeAccount {
  safe: Address;
  accountRef: AccountRef;
}

@Injectable()
export class SubgraphService {
  public client: ApolloClient<NormalizedCacheObject>;

  constructor() {
    this.client = new ApolloClient({
      link: ApolloLink.from([
        new RetryLink(),
        new HttpLink({
          uri: CONFIG.subgraphGqlUrl,
          fetch,
        }),
      ]),
      cache: new InMemoryCache(),
    });
  }

  public async userAccounts(user: Address): Promise<SafeAccount[]> {
    const { data } = await this.client.query<
      UserAccountsQuery,
      UserAccountsQueryVariables
    >({
      query: gql`
        query UserAccounts($user: ID!) {
          user(id: $user) {
            quorums(where: { active: true }) {
              account {
                id
                ref
                safe {
                  id
                }
              }
            }
          }
        }
      `,
      variables: { user: toId(user) },
    });

    return (
      data.user?.quorums.map((quorum) => ({
        safe: address(quorum.account.safe.id),
        accountRef: toAccountRef(quorum.account.ref),
      })) ?? []
    );
  }

  public async userSafes(user: Address): Promise<Address[]> {
    const safes = (await this.userAccounts(user)).map(({ safe }) => safe);
    return filterFirst(safes, (safe) => safe);
  }
}
