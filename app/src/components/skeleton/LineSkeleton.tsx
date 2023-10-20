import { Rect } from './ContentLoader';
import { Skeleton, SkeletonProps } from './Skeleton';
import { O } from 'ts-toolbelt';
import { ROUNDNESS } from '@theme/paper';

export interface LineSkeletonProps extends O.Optional<SkeletonProps, 'width' | 'height'> {}

export function LineSkeleton({ width = 100, height = 8, ...skeletonProps }: LineSkeletonProps) {
  return (
    <Skeleton width={width} height={height} {...skeletonProps}>
      <Rect x="0" y="0" rx={ROUNDNESS} ry={ROUNDNESS} width={width} height={height} />
    </Skeleton>
  );
}
