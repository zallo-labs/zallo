import { makeStyles } from '@theme/makeStyles';
import { Tokenlike, useToken } from '@token/useToken';
import { Image, ImageProps } from 'expo-image';
import { isPresent } from 'lib';
import { ImageStyle } from 'react-native';

export interface TokenIconProps extends Omit<ImageProps, 'source' | 'style'> {
  token: Tokenlike;
  size?: number;
  style?: ImageStyle;
}

export const TokenIcon = ({ token: tokenlike, size, style, ...imageProps }: TokenIconProps) => {
  const styles = useStyles(size);
  const { iconUri } = useToken(tokenlike);

  return (
    <Image
      {...imageProps}
      source={{
        uri: iconUri,
        blurhash: 'QiMahmfk~5j[N1j[NIj[oct7j[offQayfQfQa|j[t2fQflfQM}azxrj@ay', // USDC blurhash
      }}
      style={[styles.icon, style].filter(isPresent)}
    />
  );
};

const useStyles = makeStyles(({ iconSize }, size: number = iconSize.medium) => ({
  icon: {
    width: size,
    height: size,
  },
}));
