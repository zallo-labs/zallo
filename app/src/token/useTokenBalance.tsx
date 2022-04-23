import { useMemo, useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { BigNumber, ethers } from 'ethers';

import { useSafe } from '@features/safe/SafeProvider';
import { useTokenPrice } from '@gql/queries/useTokenPrice';
import { Token } from './token';
import { FIAT_DECIMALS } from './fiat';
import { ETH } from './tokens';

export const useTokenBalance = (token: Token) => {
  const safe = useSafe();
  const { price } = useTokenPrice(token);

  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  useAsyncEffect(async () => {
    try {
      setBalance(await token.getBalance(safe.safe));
    } catch (e) {
      // Do nothing
    }
  }, [token]);

  const fiatValue = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(
          balance.mul(price.current),
          token.decimals + FIAT_DECIMALS,
        ),
      ),
    [token, balance, price.current],
  );

  const ethValue = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(
          balance.mul(price.currentEth),
          token.decimals + ETH.decimals,
        ),
      ),
    [balance, price.currentEth],
  );

  return { balance, price, fiatValue, ethValue };
};
