import { useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useSafe } from '@features/safe/SafeProvider';
import { useTokenPrice } from '@gql/queries/useTokenPrice';
import { Token } from './token';
import { FIAT_DECIMALS } from './fiat';
import { ETH } from './tokens';
import { PROVIDER } from '~/provider';
import { atomFamily, useRecoilValue } from 'recoil';
import { Address } from 'lib';

type BalanceKey = {
  addr: Address;
  token: Address;
};

const tokenBalanceState = atomFamily<BigNumber, BalanceKey>({
  key: 'tokenBalance',
  default: ({ addr, token }) => {
    try {
      return PROVIDER.getBalance(addr, undefined, token);
    } catch (e) {
      console.error('Failed to fetch balance', { token, e });
      return BigNumber.from(0);
    }
  },
});

export const useTokenBalance = (token: Token) => {
  const { safe } = useSafe();
  const { price } = useTokenPrice(token);
  const balance = useRecoilValue(
    tokenBalanceState({ addr: safe.address, token: token.addr }),
  );

  const fiatValue = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(
          balance.mul(price.current),
          token.decimals + FIAT_DECIMALS,
        ),
      ),
    [token, balance, price],
  );

  const ethValue = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(
          balance.mul(price.currentEth),
          token.decimals + ETH.decimals,
        ),
      ),
    [balance, price.currentEth, token.decimals],
  );

  return { balance, price, fiatValue, ethValue };
};
