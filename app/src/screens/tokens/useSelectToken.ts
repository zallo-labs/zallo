import { useNavigation } from '@react-navigation/native';
import { Token } from '@token/token';
import { useCallback } from 'react';
import { TokensScreenParams } from './TokensScreen';

export type SelectTokenParams = Omit<TokensScreenParams, 'onSelect'>;

export const useSelectToken = (defaultParams?: SelectTokenParams) => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: SelectTokenParams) =>
      new Promise<Token>((resolve) =>
        navigate('TokensModal', {
          ...defaultParams,
          ...params,
          onSelect: resolve,
        }),
      ),
    [defaultParams, navigate],
  );
};
