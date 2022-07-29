import { Circle } from 'react-content-loader/native';
import { Skeleton } from './Skeleton';

export interface CircleSkeletonProps {
  radius?: number;
}

export const CircleSkeleton = ({ radius = 20 }: CircleSkeletonProps) => (
  <Skeleton width={radius * 2} height={radius * 2}>
    <Circle cx={radius} cy={radius} r={radius} />
  </Skeleton>
);
