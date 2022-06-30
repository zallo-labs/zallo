import { BigNumber } from 'ethers';
import { useSafe } from '@features/safe/SafeProvider';
import { Token } from './token';
import { PROVIDER } from '~/provider';
import { atomFamily, useRecoilValue } from 'recoil';
import { Address } from 'lib';
import { persistAtom } from '@util/persistAtom';
import { captureException, Severity } from '@util/sentry/sentry';

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
      captureException(e, {
        level: Severity.Error,
        extra: { token, addr },
      });
      return BigNumber.from(0);
    }
  },
  // effects: [persistAtom()],
});

export const useTokenBalance = (token: Token) => {
  const { safe } = useSafe();

  return useRecoilValue(
    tokenBalanceState({ addr: safe.address, token: token.addr }),
  );
};
