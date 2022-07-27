import { EmptyListFallback } from '@components/EmptyListFallback';
import { ActivityIcon } from '@util/theme/icons';

export const NoActivites = () => (
  <EmptyListFallback
    Icon={ActivityIcon}
    title="No activites to show"
    subtitle="Check back later!"
  />
);
