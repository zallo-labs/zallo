import { withSkeleton } from '@components/skeleton/withSkeleton';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { TokenBalanceCard } from './TokenBalanceCard';
import { useSelectedToken } from './useSelectedToken';

export const SelectedTokenCard = withSkeleton(() => {
  const token = useSelectedToken();

  return <TokenBalanceCard token={token} />;
}, CardItemSkeleton);
