import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { LineSkeleton } from '~/components/skeleton/LineSkeleton';
import { ItemProps } from './Item';
import { ItemWithoutSkeleton } from './CardItemWithoutSkeleton';

export interface CardItemSkeletonProps extends ItemProps {
  icon?: boolean;
  right?: boolean;
}

export const CardItemSkeleton = ({
  icon = true,
  right = true,
  ...props
}: CardItemSkeletonProps) => (
  <ItemWithoutSkeleton
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
