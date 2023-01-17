import { useNavigation } from '@react-navigation/native';
import { Token } from '@token/token';
import { useCallback } from 'react';
import { TokensScreenParams } from './TokensScreen';

export const useSelectToken = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (params?: Omit<TokensScreenParams, 'onSelect'>) =>
      new Promise<Token>((resolve) =>
        navigate('TokensModal', {
          ...params,
          onSelect: resolve,
        }),
      ),
    [navigate],
  );
};
