import { ListScreenSkeleton } from '@components/skeleton/ListScreenSkeleton';
import { WalletSelectorSkeleton } from './WalletSelectorSkeleton';

export const HomeScreenSkeleton = () => (
  <ListScreenSkeleton Header={<WalletSelectorSkeleton />} />
);
