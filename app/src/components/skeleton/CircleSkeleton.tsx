import { Circle } from 'react-content-loader/native';
import { Skeleton } from './Skeleton';
import { ICON_SIZE } from '@theme/paper';

export interface CircleSkeletonProps {
  size?: number;
}

export const CircleSkeleton = ({ size = ICON_SIZE.medium }: CircleSkeletonProps) => (
  <Skeleton width={size} height={size}>
    <Circle cx={size / 2} cy={size / 2} r={size / 2} />
  </Skeleton>
);
