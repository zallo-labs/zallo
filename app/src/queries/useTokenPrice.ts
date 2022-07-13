import { useQuery } from '@apollo/client';
import { BigNumber, ethers } from 'ethers';

import { uniswapGql } from '@gql/clients';
import { GetTokenPrice, GetTokenPriceVariables } from '@gql/uniswap.generated';
import { useUniswapClient } from '@gql/GqlProvider';
import { Token } from '~/token/token';
import { bigNumberToFiat, fiatToBigNumber } from '~/token/fiat';
import { ETH } from '~/token/tokens';

const QUERY = uniswapGql`
  query GetTokenPrice($token: String!, $token2: ID!) {
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

    token(id: $token2) {
      derivedETH
    }
  }
`;

export interface TokenHourlyPrice {
  timestamp: Date;
  price: BigNumber;
  open: BigNumber;
  close: BigNumber;
}

export interface TokenPrice {
  hourly: TokenHourlyPrice[];
  current: BigNumber;
  yesterday: BigNumber;
  delta: number;
  currentEth: BigNumber;
}

export const useTokenPrice = (token: Token) => {
  const tokenAddr = token.addresses.mainnet?.toLowerCase() ?? '';
  const { data, ...rest } = useQuery<GetTokenPrice, GetTokenPriceVariables>(
    QUERY,
    {
      client: useUniswapClient(),
      variables: {
        token: tokenAddr,
        token2: tokenAddr,
      },
    },
  );

  const hourly = (data?.tokenHourDatas ?? []).map(
    (data): TokenHourlyPrice => ({
      timestamp: new Date(data.periodStartUnix * 1000),
      price: fiatToBigNumber(data.close),
      open: fiatToBigNumber(data.open),
      close: fiatToBigNumber(data.close),
    }),
  );

  const current = hourly[0]?.price ?? BigNumber.from(0);
  const yesterday = hourly[24]?.price ?? BigNumber.from(0);

  const cur = bigNumberToFiat(current);
  const yd = bigNumberToFiat(yesterday);

  const price: TokenPrice = {
    hourly,
    current: current,
    yesterday: yesterday,
    delta: yd > 0 ? ((cur - yd) / yd) * 100 : 100,
    // parseEther() throws if the eth has > 18 decimals
    currentEth: data?.token?.derivedETH
      ? ethers.utils.parseEther(
          parseFloat(data.token.derivedETH).toFixed(ETH.decimals),
        )
      : BigNumber.from(0),
  };

  return { price, ...rest };
};
