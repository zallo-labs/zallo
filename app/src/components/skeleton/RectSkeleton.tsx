import { Rect } from './ContentLoader';
import { Skeleton, SkeletonProps } from './Skeleton';
import { O } from 'ts-toolbelt';
import { CORNER } from '@theme/paper';

export interface RectSkeletonProps extends O.Optional<SkeletonProps, 'width'> {}

export function RectSkeleton({ width = '100%', height, ...skeletonProps }: RectSkeletonProps) { 
  return (
    <Skeleton width={width} height={height} {...skeletonProps}>
      <Rect x="0" y="0" rx={CORNER.l} ry={CORNER.l} width={width} height={height} />
    </Skeleton>
  );
}
