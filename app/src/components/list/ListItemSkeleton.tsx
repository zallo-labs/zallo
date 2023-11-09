import { CircleSkeleton } from '../skeleton/CircleSkeleton';
import { LineSkeleton } from '../skeleton/LineSkeleton';
import { ListItem } from './ListItem';

export interface ListItemSkeletonProps {
  leading?: boolean;
  supporting?: boolean;
  trailing?: boolean;
}

export function ListItemSkeleton({ leading, supporting, trailing }: ListItemSkeletonProps) {
  return (
    <ListItem
      leading={leading ? () => <CircleSkeleton /> : undefined}
      headline={({ Text }) => (
        <Text>
          <LineSkeleton width={140} height={8} />
        </Text>
      )}
      supporting={
        supporting
          ? ({ Text }) => (
              <Text>
                <LineSkeleton width={80} height={6} />
              </Text>
            )
          : undefined
      }
      trailing={
        trailing
          ? ({ Text }) => (
              <Text>
                <LineSkeleton width={40} height={6} />
              </Text>
            )
          : undefined
      }
    />
  );
}
