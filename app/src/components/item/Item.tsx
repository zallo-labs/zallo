import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ItemSkeleton } from './ItemSkeleton';
import { ItemWithoutSkeleton, ItemWithoutSkeletonProps } from './ItemWithoutSkeleton';

export type ItemProps = ItemWithoutSkeletonProps;

export const Item = withSkeleton(
  (props: ItemProps) => <ItemWithoutSkeleton {...props} />,
  ItemSkeleton,
);
