import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { WalletSelectorSkeleton } from './WalletSelector/WalletSelectorSkeleton';

export const HomeScreenSkeleton = () => (
  <ListScreenSkeleton Header={<WalletSelectorSkeleton />} menu title={false} />
);
