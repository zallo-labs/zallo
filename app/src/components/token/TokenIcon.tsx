import { useState } from 'react';
import { Image } from 'react-native';
import { PRIMARY_ICON_SIZE } from '../list/Item';
import { LabelIcon } from '@components/LabelIcon';

import { Token } from '~/token/token';
import { SvgUri } from '@components/SvgUri';

const dimensions = {
  width: PRIMARY_ICON_SIZE,
  height: PRIMARY_ICON_SIZE,
};

export interface TokenIconProps {
  token: Token;
}

export const TokenIcon = ({ token: { iconUri, symbol } }: TokenIconProps) => {
  const [fallback, setFallback] = useState(false);
  const handleError = () => setFallback(true);

  if (fallback) return <LabelIcon label={symbol} />;

  if (iconUri.toLowerCase().endsWith('.svg'))
    return <SvgUri uri={iconUri} {...dimensions} onError={handleError} />;

  return (
    <Image
      source={{ uri: iconUri }}
      style={dimensions}
      resizeMode="contain"
      onError={handleError}
    />
  );
};
