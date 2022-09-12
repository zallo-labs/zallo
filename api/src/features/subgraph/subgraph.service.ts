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
  WalletRef,
  address,
  Address,
  filterFirst,
  toWalletRef,
  toId,
} from 'lib';
import {
  UserWalletsQuery,
  UserWalletsQueryVariables,
} from '@gen/generated.subgraph';

export interface AccountWallet {
  account: Address;
  walletRef: WalletRef;
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

  public async deviceWallets(device: Address): Promise<AccountWallet[]> {
    const { data } = await this.client.query<
      UserWalletsQuery,
      UserWalletsQueryVariables
    >({
      query: gql`
        query UserWallets($user: ID!) {
          user(id: $user) {
            quorums {
              quorum {
                wallet {
                  id
                  ref
                  account {
                    id
                  }
                }
              }
            }
          }
        }
      `,
      variables: { user: toId(device) },
    });

    return (
      data.user?.quorums.map(({ quorum: { wallet } }) => ({
        account: address(wallet.account.id),
        walletRef: toWalletRef(wallet.ref),
      })) ?? []
    );
  }

  public async deviceAccounts(device: Address): Promise<Address[]> {
    const accounts = (await this.deviceWallets(device)).map(
      ({ account }) => account,
    );
    return filterFirst(accounts, (account) => account);
  }
}
