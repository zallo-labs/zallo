import { withSkeleton } from '@components/skeleton/withSkeleton';
import { CardItemSkeleton } from './CardItemSkeleton';
import {
  CardItemWithoutSkeleton,
  CardItemWithoutSkeletonProps,
} from './CardItemWithoutSkeleton';

export type CardItemProps = CardItemWithoutSkeletonProps;

export const CardItem = withSkeleton(
  (props: CardItemProps) => <CardItemWithoutSkeleton {...props} />,
  CardItemSkeleton,
);
