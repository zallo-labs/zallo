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
import { AccountRef, address, Address, toId } from 'lib';
import {
  UserSafesQuery,
  UserSafesQueryVariables,
} from '@gen/generated.subgraph';

export interface SafeAccount {
  safe: Address;
  accountRef: AccountRef;
}

@Injectable()
export class SubgraphService extends ApolloClient<NormalizedCacheObject> {
  constructor() {
    super({
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

  public async userSafes(user: Address): Promise<Address[]> {
    const { data } = await this.query<UserSafesQuery, UserSafesQueryVariables>({
      query: gql`
        query UserSafes($user: ID!) {
          user(id: $user) {
            id
            approvers {
              approverSet {
                group {
                  safe {
                    id
                    groups {
                      active
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { user: toId(user) },
    });

    return (
      data.user?.approvers
        .map((a) => a.approverSet.group.safe)
        .filter((s) => s.groups.some((g) => g.active))
        .map((s) => address(s.id)) ?? []
    );
  }

  public async userAccounts(user: Address): Promise<SafeAccount[]> {
    // TODO: implement
    return [];
  }
}
