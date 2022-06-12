import { Rect } from 'react-content-loader/native';
import { Skeleton } from './Skeleton';

export interface LineSkeletonProps {
  width?: number;
  height?: number;
}

export const LineSkeleton = ({
  width = 100,
  height = 10,
}: LineSkeletonProps) => (
  <Skeleton width={width} height={height}>
    <Rect
      x="0"
      y="0"
      rx={height / 2}
      ry={height / 2}
      width={width}
      height={height}
    />
  </Skeleton>
);
