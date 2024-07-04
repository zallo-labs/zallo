import { GenericTokenIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image, ImageProps } from '#/Image';
import { ImageStyle, StyleProp } from 'react-native';
import { CircleSkeleton } from '#/skeleton/CircleSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { memo } from 'react';
import deepEqual from 'fast-deep-equal';
import _ from 'lodash';
import { ICON_SIZE } from '@theme/paper';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { TokenIcon_token$key } from '~/api/__generated__/TokenIcon_token.graphql';

const Token = graphql`
  fragment TokenIcon_token on Token {
    id
    icon
  }
`;

export interface TokenIconProps extends Omit<ImageProps, 'source' | 'style'> {
  token: TokenIcon_token$key | null | undefined;
  fallbackUri?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

function TokenIcon_({
  token: tokenFragment,
  fallbackUri,
  size = ICON_SIZE.medium,
  style,
  ...imageProps
}: TokenIconProps) {
  const { styles } = useStyles(stylesheet);

  const url = useFragment(Token, tokenFragment)?.icon ?? fallbackUri;

  if (!url)
    return <GenericTokenIcon {...imageProps} size={size} style={[style, styles.icon(size)]} />;

  return (
    <Image
      {...imageProps}
      source={{ uri: url }}
      style={[style, styles.icon(size)]}
      cachePolicy="memory-disk"
    />
  );
}

const stylesheet = createStyles(({ iconSize }) => ({
  icon: (size: number = iconSize.medium) => ({
    width: size,
    height: size,
    backgroundColor: undefined,
  }),
}));

export const TokenIcon = withSuspense(
  memo(TokenIcon_, (prev, next) => deepEqual(normalizeProps(prev), normalizeProps(next))),
  ({ size }) => <CircleSkeleton size={size} />,
);

function normalizeProps(props: any) {
  if (typeof props.token !== 'object') return props;

  return {
    ...props,
    token: _.pick(props.token, ['id', 'icon']),
  };
}
