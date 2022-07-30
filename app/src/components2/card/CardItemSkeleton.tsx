import { Box } from '@components/Box';
import { CircleSkeleton } from '@components/skeleton/CircleSkeleton';
import { LineSkeleton } from '@components/skeleton/LineSkeleton';
import {
  CardItemWithoutSkeleton,
  CardItemWithoutSkeletonProps,
} from './CardItemWithoutSkeleton';

export const CardItemSkeleton = (props: CardItemWithoutSkeletonProps) => (
  <CardItemWithoutSkeleton
    Left={<CircleSkeleton />}
    Main={
      <Box flex={1} justifyContent="space-around" alignItems="flex-start">
        <LineSkeleton width={100} height={8} />
        <LineSkeleton width={60} height={7} />
      </Box>
    }
    Right={<LineSkeleton width={60} height={7} />}
    {...props}
  />
);
