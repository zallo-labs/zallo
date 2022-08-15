import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';

export const useCreateWallet = () => {
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();

  return useCallback(
    () =>
      navigate('Accounts', {
        onSelect: (account) => navigate('Wallet', { account }),
      }),
    [navigate],
  );
};
