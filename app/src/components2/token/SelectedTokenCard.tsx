import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { TokenBalanceCard } from './TokenBalanceCard';
import { useSelectedToken, useSelectToken } from './useSelectedToken';

export const SelectedTokenCard = withSkeleton(() => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();
  const token = useSelectedToken();
  const select = useSelectToken();

  const handlePress = useCallback(
    () => navigation.navigate('Tokens', { onSelect: select }),
    [navigation, select],
  );

  return <TokenBalanceCard token={token} onPress={handlePress} />;
}, CardItemSkeleton);
