import { Injectable } from '@nestjs/common';
import { Address, UAddress } from 'lib';
import { Price } from './prices.model';
import { gql } from './__generated__';
import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { retryExchange } from '@urql/exchange-retry';
import { requestPolicyExchange } from '@urql/exchange-request-policy';

const QueryDoc = gql(/* GraphQL */ `
  query Price($token: String!) {
    current: tokenHourDatas(
      where: { token: $token }
      first: 1
      orderBy: periodStartUnix
      orderDirection: desc
    ) {
      priceUSD
    }

    # yesterday: tokenHourDatas(
    #   where: { token: $token }
    #   first: 1
    #   skip: 24
    #   orderBy: periodStartUnix
    #   orderDirection: desc
    # ) {
    #   priceUSD
    # }
  }
`);

@Injectable()
export class PricesService {
  private uniswap: Client;

  constructor() {
    this.uniswap = new Client({
      url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      exchanges: [
        requestPolicyExchange({ ttl: 30_000 /* 30s */ }),
        cacheExchange,
        retryExchange({}),
        fetchExchange,
      ],
    });
  }

  async price(token: UAddress, ethereumAddress: Address | undefined): Promise<Price | null> {
    if (!ethereumAddress) return null;

    const data = (await this.uniswap.query(QueryDoc, { token: ethereumAddress.toLowerCase() }))
      .data;

    const current = data?.current[0]?.priceUSD ? parseFloat(data.current[0].priceUSD) : undefined;
    // const yesterday = data?.yesterday[0]?.priceUSD ?? 0;
    if (current === undefined) return null;

    return {
      id: `Price::${token}`,
      token,
      current,
    };
  }
}
