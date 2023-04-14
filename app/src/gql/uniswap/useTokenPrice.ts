import { gql } from '@apollo/client';
import {
  TokenPriceDataDocument,
  TokenPriceDataQuery,
  TokenPriceDataQueryVariables,
} from '@uniswap/generated';
import { Token } from '@token/token';
import { atomFamily, DefaultValue, selectorFamily, useRecoilValue } from 'recoil';
import { Address } from 'lib';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { UNISWAP_CLIENT } from './client';
import { fiatAsBigInt } from '@token/fiat';
import { tokenAtom } from '@token/useToken';
import { persistAtom } from '~/util/effect/persistAtom';

gql`
  fragment TokenHourFields on TokenHourData {
    priceUSD
  }

  query TokenPriceData($token: String!) {
    now: tokenHourDatas(
      where: { token: $token }
      first: 1
      orderBy: periodStartUnix
      orderDirection: desc
    ) {
      ...TokenHourFields
    }

    yesterday: tokenHourDatas(
      where: { token: $token }
      first: 1
      skip: 24
      orderBy: periodStartUnix
      orderDirection: desc
    ) {
      ...TokenHourFields
    }
  }
`;

export interface TokenPriceData {
  current: bigint;
  change: number;
}

const fetchSelector = selectorFamily<TokenPriceData, Address>({
  key: 'FetchTokenPriceData',
  get:
    (addr) =>
    async ({ get }) => {
      const ethereumAddress = get(tokenAtom(addr)).addresses.ethereum?.toLocaleLowerCase();
      if (!ethereumAddress)
        throw new Error("Can't fetch uniswap price for token without mainnet address");

      const client = await UNISWAP_CLIENT;
      const { data } = await client.query<TokenPriceDataQuery, TokenPriceDataQueryVariables>({
        query: TokenPriceDataDocument,
        variables: { token: ethereumAddress },
      });

      const cur: number = data?.now[0]?.priceUSD ?? 0;
      const yd: number = data?.yesterday[0]?.priceUSD ?? 0;

      return {
        current: fiatAsBigInt(cur),
        change: yd > 0 ? ((cur - yd) / yd) * 100 : Number.POSITIVE_INFINITY,
      };
    },
});

export const tokenPriceDataAtom = atomFamily<TokenPriceData, Address>({
  key: 'TokenPrice',
  default: (token) => fetchSelector(token),
  effects: (token) => [
    // persistAtom({}),
    refreshAtom({
      refresh: ({ get }) => get(fetchSelector(token)),
      interval: 10 * 1000,
    }),
  ],
});

export const useTokenPriceData = (token: Token | Address) =>
  useRecoilValue(tokenPriceDataAtom(typeof token === 'object' ? token.address : token));
