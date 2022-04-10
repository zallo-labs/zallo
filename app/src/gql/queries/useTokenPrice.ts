import { useQuery } from '@apollo/client';
import { uniswapGql, UNISWAP_CLIENT } from '@gql/clients';

import { Token } from '@features/token/token';
import { GetTokenPrice, GetTokenPriceVariables } from '@gql/uniswap.generated';

const QUERY = uniswapGql`
  query GetTokenPrice($token: String!) {
    tokenHourDatas(
      first: 25
      orderBy: periodStartUnix
      orderDirection: desc
      where: { token: $token }
    ) {
      periodStartUnix
      priceUSD
      open
      close
    }
  }
`;

export interface TokenHourlyPrice {
  timestamp: Date;
  price: number;
  open: number;
  close: number;
}

export interface TokenPrice {
  hourly: TokenHourlyPrice[];
  current: number;
  yesterday: number;
  delta: number;
}

export const useTokenPrice = (token: Token) => {
  const { data, ...rest } = useQuery<GetTokenPrice, GetTokenPriceVariables>(QUERY, {
    client: UNISWAP_CLIENT,
    variables: { token: token.addresses.mainnet.toLowerCase() },
  });

  const hourly = (data?.tokenHourDatas ?? []).map(
    (data): TokenHourlyPrice => ({
      timestamp: new Date(data.periodStartUnix * 1000),
      price: parseFloat(data.close),
      open: parseFloat(data.open),
      close: parseFloat(data.close),
    }),
  );

  const current = hourly[0]?.price ?? 0;
  const yesterday = hourly[24]?.price ?? 0;

  const price: TokenPrice = {
    hourly,
    current: current,
    yesterday: yesterday,
    delta: yesterday > 0 ? ((current - yesterday) / yesterday) * 100 : 100,
  };

  return { price, ...rest };
};
