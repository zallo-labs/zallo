import { withSuspense } from '~/components/skeleton/withSuspense';
import { CardItemSkeleton } from './CardItemSkeleton';
import { CardItemWithoutSkeleton, CardItemWithoutSkeletonProps } from './CardItemWithoutSkeleton';

export type CardItemProps = CardItemWithoutSkeletonProps;

export const CardItem = withSuspense(
  (props: CardItemProps) => <CardItemWithoutSkeleton {...props} />,
  CardItemSkeleton,
);
