import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { withSkeleton } from '../skeleton/withSkeleton';
import { TokenBalanceCard } from './TokenBalanceCard';
import { useSelectedToken, useSelectToken } from './useSelectedToken';

export const SelectedTokenCard = withSkeleton(() => {
  const navigation = useRootNavigation();
  const token = useSelectedToken();
  const select = useSelectToken();

  const handlePress = useCallback(
    () => navigation.navigate('Tokens', { onSelect: select }),
    [navigation, select],
  );

  return <TokenBalanceCard token={token} onPress={handlePress} />;
}, CardItemSkeleton);
