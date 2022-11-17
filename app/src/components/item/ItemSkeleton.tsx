import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { LineSkeleton } from '~/components/skeleton/LineSkeleton';
import { ItemProps } from './Item';
import { ItemWithoutSkeleton } from './ItemWithoutSkeleton';

export interface ItemSkeletonProps extends ItemProps {
  icon?: boolean;
  right?: boolean;
}

export const ItemSkeleton = ({ icon = true, right = true, ...props }: ItemSkeletonProps) => (
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
