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
    Main={<LineSkeleton width={100} height={8} />}
    {...(right && {
      Right: <LineSkeleton width={60} height={7} />,
    })}
    {...props}
  />
);
