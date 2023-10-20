import { Circle } from './ContentLoader';
import { Skeleton } from './Skeleton';
import { ICON_SIZE } from '@theme/paper';

export interface CircleSkeletonProps {
  size?: number;
}

export function CircleSkeleton({ size = ICON_SIZE.medium }: CircleSkeletonProps) {
  return (
    <Skeleton width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} />
    </Skeleton>
  );
}
