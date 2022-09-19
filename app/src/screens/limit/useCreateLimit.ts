import { address, UserConfig } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedUser } from '~/queries/user/useUser.api';
import { LimitScreenParams } from './LimitScreen';

export const useCreateLimit = (user: CombinedUser, config: UserConfig) => {
  const { navigate, replace } = useRootNavigation();

  return useCallback(
    (params: Omit<LimitScreenParams, 'token' | 'limit'>) =>
      navigate('Tokens', {
        user,
        disabled: Object.keys(config.limits).map(address),
        onSelect: (token) =>
          replace('Limit', {
            token: token.addr,
            ...params,
          }),
      }),
    [config.limits, navigate, replace, user],
  );
};
