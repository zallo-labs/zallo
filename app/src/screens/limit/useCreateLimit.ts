import { address, Limit, UserConfig } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedUser } from '~/queries/user/useUser.api';

export const useCreateLimit = (user: CombinedUser, config: UserConfig) => {
  const { navigate, replace } = useRootNavigation();

  return useCallback(
    (onChange: (limit: Limit) => void) =>
      navigate('Tokens', {
        user,
        disabled: Object.keys(config.limits).map(address),
        onSelect: (token) =>
          replace('Limit', {
            user,
            token: token.addr,
            onChange,
          }),
      }),
    [config.limits, navigate, replace, user],
  );
};
