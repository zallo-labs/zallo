import { useNavigation } from '@react-navigation/native';
import { Token } from '@token/token';
import { useCallback } from 'react';
import { TokensScreenParams } from './TokensScreen';

export type SelectTokenParams = Omit<TokensScreenParams, 'onSelect'>;

export const useSelectToken = (defaultParams?: SelectTokenParams) => {
  const { navigate, goBack } = useNavigation();

  return useCallback(
    async (params?: SelectTokenParams) => {
      const promise = new Promise<Token>((resolve) =>
        navigate('TokensModal', {
          ...defaultParams,
          ...params,
          onSelect: resolve,
        }),
      );

      const r = await promise;
      goBack();

      return r;
    },
    [defaultParams, navigate],
  );
};
