import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { TokensScreenParams } from './TokensScreen';

export const useSelectToken = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (
      params: Required<Pick<TokensScreenParams, 'onSelect'>> & Omit<TokensScreenParams, 'onSelect'>,
    ) => navigate('TokensModal', params),
    [navigate],
  );
};
