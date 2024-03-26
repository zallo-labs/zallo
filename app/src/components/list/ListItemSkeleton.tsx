import { CircleSkeleton } from '../skeleton/CircleSkeleton';
import { LineSkeleton } from '../skeleton/LineSkeleton';
import { ListItem, ListItemProps } from './ListItem';

export interface ListItemSkeletonProps {
  leading?: ListItemProps['leading'] | boolean;
  supporting?: boolean;
  trailing?: boolean;
}

export function ListItemSkeleton({ leading, supporting, trailing }: ListItemSkeletonProps) {
  return (
    <ListItem
      leading={leading ? (leading === true ? () => <CircleSkeleton /> : leading) : undefined}
      headline={<LineSkeleton width={140} height={8} />}
      supporting={supporting ? <LineSkeleton width={80} height={6} /> : undefined}
      trailing={trailing ? <LineSkeleton width={40} height={6} /> : undefined}
    />
  );
}
