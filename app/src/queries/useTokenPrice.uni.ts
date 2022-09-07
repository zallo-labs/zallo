import { gql } from '@apollo/client';
import { BigNumber } from 'ethers';
import {
  TokenPriceDataDocument,
  TokenPriceDataQuery,
  TokenPriceDataQueryVariables,
} from '~/gql/generated.uni';
import { Token } from '@token/token';
import { atomFamily, useRecoilValue } from 'recoil';
import { Address } from 'lib';
import { refreshAtom } from '~/util/effect/refreshAtom';
import { UNISWAP_CLIENT } from '~/gql/clients/uniswap';
import { fiatToBigNumber } from '@token/fiat';

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

const fetch = async (token: Address): Promise<TokenPrice> => {
  const client = await UNISWAP_CLIENT;

  const { data } = await client.query<
    TokenPriceDataQuery,
    TokenPriceDataQueryVariables
  >({
    query: TokenPriceDataDocument,
    variables: { token: token.toLocaleLowerCase() },
  });

  const cur: number = data?.now[0]?.priceUSD ?? 0;
  const yd: number = data?.yesterday[0]?.priceUSD ?? 0;

  return {
    current: fiatToBigNumber(cur),
    yesterday: fiatToBigNumber(yd),
    change: yd > 0 ? ((cur - yd) / yd) * 100 : Number.POSITIVE_INFINITY,
  };
};

export const TOKEN_PRICE_ATOM = atomFamily<TokenPrice, Address>({
  key: 'tokenPrice',
  default: fetch,
  effects: (token) => [
    refreshAtom({
      fetch: () => fetch(token),
      interval: 15 * 1000,
    }),
  ],
});

export const useTokenPrice = (token: Token) =>
  useRecoilValue(TOKEN_PRICE_ATOM(token.addresses.mainnet!));
