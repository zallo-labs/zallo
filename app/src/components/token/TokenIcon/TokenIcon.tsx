import { makeStyles } from '@theme/makeStyles';
import { Tokenlike, useToken } from '@token/useToken';
import { Image, ImageProps } from 'expo-image';
import { isPresent } from 'lib';
import { ImageStyle } from 'react-native';
import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';

export interface TokenIconProps extends Omit<ImageProps, 'source' | 'style'> {
  token: Tokenlike;
  size?: number;
  style?: ImageStyle;
}

export const TokenIcon = withSuspense(
  ({ token: tokenlike, size, style, ...imageProps }: TokenIconProps) => {
    const styles = useStyles(size);
    const { iconUri } = useToken(tokenlike);

    return (
      <Image
        {...imageProps}
        source={{ uri: iconUri }}
        style={[style, styles.icon].filter(isPresent)}
      />
    );
  },
  CircleSkeleton,
);

const useStyles = makeStyles(({ iconSize }, size: number = iconSize.medium) => ({
  icon: {
    width: size,
    height: size,
    backgroundColor: undefined,
  },
}));
