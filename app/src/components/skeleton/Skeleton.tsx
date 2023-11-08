import { createStyles, useStyles } from '@theme/styles';
import { ContentLoader, IContentLoaderProps } from './ContentLoader';
import { NumberProp } from 'react-native-svg';

export type SkeletonProps = IContentLoaderProps & {
  width: NumberProp;
  height: NumberProp;
};

/*
 * Skeleton generator: https://skeletonreact.com
 */
export function Skeleton({ children, width, height, ...props }: SkeletonProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <ContentLoader
      speed={2}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      foregroundColor={styles.loader.color}
      backgroundColor={styles.loader.backgroundColor}
      {...props}
    >
      {children}
    </ContentLoader>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  loader: {
    color: colors.surface,
    backgroundColor: colors.surfaceVariant,
  },
}));
