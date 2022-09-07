import { gql } from '@apollo/client';
import { BigNumber } from 'ethers';
import {
  TokenPriceDataDocument,
  TokenPriceDataQuery,
  TokenPriceDataQueryVariables,
} from '~/gql/generated.uni';
import { Token } from '@token/token';
import { atomFamily, selectorFamily, useRecoilValue } from 'recoil';
import { Address } from 'lib';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { UNISWAP_CLIENT } from '~/gql/clients/uniswap';
import { fiatToBigNumber } from '@token/fiat';
import { TOKEN } from '@token/useToken';
import assert from 'assert';

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

export interface TokenPrice {
  current: BigNumber;
  yesterday: BigNumber;
  change: number;
}

const fetch = async (tokenMainnetAddr?: Address): Promise<TokenPrice> => {
  assert(
    tokenMainnetAddr,
    "Fetching price for token that doesn't have a mainnet address",
  );
  const client = await UNISWAP_CLIENT;

  const { data } = await client.query<
    TokenPriceDataQuery,
    TokenPriceDataQueryVariables
  >({
    query: TokenPriceDataDocument,
    variables: { token: tokenMainnetAddr.toLocaleLowerCase() },
  });

  const cur: number = data?.now[0]?.priceUSD ?? 0;
  const yd: number = data?.yesterday[0]?.priceUSD ?? 0;

  return {
    current: fiatToBigNumber(cur),
    yesterday: fiatToBigNumber(yd),
    change: yd > 0 ? ((cur - yd) / yd) * 100 : Number.POSITIVE_INFINITY,
  };
};

const FETCH_TOKEN_PRICE = selectorFamily<TokenPrice, Address>({
  key: 'fetchTokenPrice',
  get:
    (addr) =>
    ({ get }) => {
      assert(addr);
      return fetch(get(TOKEN(addr)).addresses.mainnet);
    },
});

export const TOKEN_PRICE = atomFamily<TokenPrice, Address>({
  key: 'tokenPrice',
  default: (token) => FETCH_TOKEN_PRICE(token),
  effects: (token) => [
    refreshAtom({
      fetch: ({ get }) => get(FETCH_TOKEN_PRICE(token)),
      interval: 10 * 1000,
    }),
  ],
});

export const useTokenPrice = (token: Token | Address) =>
  useRecoilValue(TOKEN_PRICE(typeof token === 'object' ? token.addr : token));
