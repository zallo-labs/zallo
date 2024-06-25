import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { GenericTokenIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image, ImageProps } from '#/Image';
import { UAddress, asUAddress, isUAddress } from 'lib';
import { ImageStyle, StyleProp } from 'react-native';
import { CircleSkeleton } from '#/skeleton/CircleSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { memo } from 'react';
import deepEqual from 'fast-deep-equal';
import _ from 'lodash';
import { ICON_SIZE } from '@theme/paper';

const Query = gql(/* GraphQL */ `
  query TokenIcon($token: UAddress!) {
    token(address: $token) {
      ...TokenIcon_Token
    }
  }
`);

const Token = gql(/* GraphQL */ `
  fragment TokenIcon_Token on Token {
    id
    icon
  }
`);

export interface TokenIconProps extends Omit<ImageProps, 'source' | 'style'> {
  token: FragmentType<typeof Token> | UAddress | null | undefined;
  fallbackUri?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

function TokenIcon_({
  token: fragOrAddr,
  fallbackUri,
  size = ICON_SIZE.medium,
  style,
  ...imageProps
}: TokenIconProps) {
  const { styles } = useStyles(stylesheet);

  const addr = isUAddress(fragOrAddr) ? fragOrAddr : undefined;
  const query = useQuery(
    Query,
    { token: addr ?? 'zksync:0x' },
    { pause: !addr, requestPolicy: 'cache-first' },
  ).data;

  const url =
    getFragment(Token, !isUAddress(fragOrAddr) ? fragOrAddr : query?.token)?.icon ?? fallbackUri;

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
