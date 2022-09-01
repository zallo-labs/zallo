import { address } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedWallet } from '~/queries/wallets';
import { LimitScreenParams } from './LimitScreen';

export const useCreateLimit = (wallet: CombinedWallet) => {
  const { navigate, replace } = useRootNavigation();

  return useCallback(
    (params: Omit<LimitScreenParams, 'token' | 'limit'>) =>
      navigate('Tokens', {
        wallet,
        disabled: Object.keys(wallet.limits.tokens).map(address),
        onSelect: (token) =>
          replace('Limit', {
            token: token.addr,
            ...params,
          }),
      }),
    [navigate, replace, wallet],
  );
};
