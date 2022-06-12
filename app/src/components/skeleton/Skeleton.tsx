import ContentLoader, {
  IContentLoaderProps,
} from 'react-content-loader/native';
import { NumberProp } from 'react-native-svg';

export type SkeletonProps = IContentLoaderProps & {
  width: NumberProp;
  height: NumberProp;
};

/*
 * Skeleton generator: https://skeletonreact.com
 */
export const Skeleton = ({
  children,
  width,
  height,
  ...props
}: SkeletonProps) => (
  <ContentLoader
    speed={2}
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    backgroundColor="#e9e2d9"
    foregroundColor="#ffb0c9"
    {...props}
  >
    {children}
  </ContentLoader>
);
