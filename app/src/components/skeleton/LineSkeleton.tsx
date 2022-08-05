import { useTheme } from '@util/theme/paper';
import { Rect } from 'react-content-loader/native';
import { Skeleton } from './Skeleton';

export interface LineSkeletonProps {
  width?: number;
  height?: number;
}

export const LineSkeleton = ({
  width = 100,
  height = 10,
}: LineSkeletonProps) => {
  const { roundness } = useTheme();

  return (
    <Skeleton width={width} height={height}>
      <Rect
        x="0"
        y="0"
        rx={roundness}
        ry={roundness}
        width={width}
        height={height}
      />
    </Skeleton>
  );
};
