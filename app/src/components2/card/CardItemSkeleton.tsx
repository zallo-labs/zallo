import { Box } from '@components/Box';
import { CircleSkeleton } from '@components/skeleton/CircleSkeleton';
import { LineSkeleton } from '@components/skeleton/LineSkeleton';
import { CardItemProps } from './CardItem';
import { CardItemWithoutSkeleton } from './CardItemWithoutSkeleton';

export interface CardItemSkeletonProps extends CardItemProps {
  icon?: boolean;
  right?: boolean;
}

export const CardItemSkeleton = ({
  icon = true,
  right = true,
  ...props
}: CardItemSkeletonProps) => (
  <CardItemWithoutSkeleton
    {...(icon && {
      Left: <CircleSkeleton />,
    })}
    Main={
      <Box flex={1} justifyContent="space-around" alignItems="flex-start">
        <LineSkeleton width={100} height={8} />
        <LineSkeleton width={60} height={7} />
      </Box>
    }
    {...(right && {
      Right: <LineSkeleton width={60} height={7} />,
    })}
    {...props}
  />
);
