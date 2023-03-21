import { withSuspense } from '~/components/skeleton/withSuspense';
import { ItemSkeleton } from './ItemSkeleton';
import { ItemWithoutSkeleton, ItemWithoutSkeletonProps } from './ItemWithoutSkeleton';

export type ItemProps = ItemWithoutSkeletonProps;

export const Item = withSuspense(
  (props: ItemProps) => <ItemWithoutSkeleton {...props} />,
  ItemSkeleton,
);
