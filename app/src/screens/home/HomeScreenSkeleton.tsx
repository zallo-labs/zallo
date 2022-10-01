import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { AccountSelectorSkeleton } from '../../components/account/AccountSelector/AccountSelectorSkeleton';

export const HomeScreenSkeleton = () => (
  <ListScreenSkeleton Header={<AccountSelectorSkeleton />} menu title={false} />
);
