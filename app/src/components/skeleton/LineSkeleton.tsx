import { useTheme } from '@theme/paper';
import { Rect } from 'react-content-loader/native';
import { Skeleton, SkeletonProps } from './Skeleton';
import { O } from 'ts-toolbelt';

export interface LineSkeletonProps extends O.Optional<SkeletonProps, 'width' | 'height'> {}

export const LineSkeleton = ({ width = 100, height = 8, ...skeletonProps }: LineSkeletonProps) => {
  const { roundness } = useTheme();

  return (
    <Skeleton width={width} height={height} {...skeletonProps}>
      <Rect x="0" y="0" rx={roundness} ry={roundness} width={width} height={height} />
    </Skeleton>
  );
};
