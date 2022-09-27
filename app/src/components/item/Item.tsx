import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { CardItemSkeleton } from './CardItemSkeleton';
import {
  ItemWithoutSkeleton,
  ItemWithoutSkeletonProps,
} from './CardItemWithoutSkeleton';

export type ItemProps = ItemWithoutSkeletonProps;

export const Item = withSkeleton(
  (props: ItemProps) => <ItemWithoutSkeleton {...props} />,
  CardItemSkeleton,
);
