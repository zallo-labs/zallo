import { useState } from 'react';
import useAsyncEffect from 'use-async-effect';

import { BigNumber } from '@ethers';
import { useSafe } from '@features/safe/SafeProvider';
import { Token } from './token';

export const useTokenBalance = (token: Token) => {
  const safe = useSafe();

  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  useAsyncEffect(async () => {
    try {
      setBalance(await token.getBalance(safe.contract));
    } catch (e) {
      console.debug(token.addr, e);
    }
  }, [token]);

  return balance;
};
