import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { SvgUri } from 'react-native-svg';

import { Token } from '../../features/token/token';

const SIZE = 44;

export interface TokenIconProps {
  token: Token;
}

export const TokenIcon = ({ token: t }: TokenIconProps) => {
  const [fallback, setFallback] = useState(false);

  if (fallback) return <Avatar.Text size={SIZE} label={t.symbol.slice(0, 2)} />;

  if (t.iconUri.toLowerCase().endsWith('.svg'))
    return <SvgUri uri={t.iconUri} width={SIZE} height={SIZE} />;

  return (
    <Image
      source={{ uri: t.iconUri }}
      style={styles.image}
      resizeMode="contain"
      onError={() => setFallback(true)}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE * 2,
  },
});
