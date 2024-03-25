import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { materialCommunityIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image, ImageProps } from 'expo-image';
import { UAddress, isUAddress } from 'lib';
import { ImageStyle, StyleProp } from 'react-native';
import { CircleSkeleton } from '#/skeleton/CircleSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { memo } from 'react';
import deepEqual from 'fast-deep-equal';
import _ from 'lodash';

export const ETH_ICON_URI =
  'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png';
Image.prefetch(ETH_ICON_URI);

export const UnknownTokenIcon = materialCommunityIcon('help-circle-outline');

const Query = gql(/* GraphQL */ `
  query TokenIcon($token: UAddress!) {
    token(input: { address: $token }) {
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

/**
 * @summary Trims the token to only the fragment fields to avoid unnecessary re-renders\\n
 * @see https://github.com/urql-graphql/urql/issues/1408
 * @returns Token fields required by TokenIcon
 */
export function trimTokenIconTokenProp(token: any): any {
  return _.pick(token, ['id', 'iconUri']);
}

export interface TokenIconProps extends Omit<ImageProps, 'source' | 'style'> {
  token: FragmentType<typeof Token> | UAddress | null | undefined;
  fallbackUri?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

function TokenIcon_({
  token: fragOrAddr,
  fallbackUri,
  size,
  style,
  ...imageProps
}: TokenIconProps) {
  const { styles } = useStyles(stylesheet);

  const query = useQuery(
    Query,
    { token: isUAddress(fragOrAddr) ? fragOrAddr : 'zksync:0x' },
    { pause: !isUAddress(fragOrAddr) },
  ).data;

  const iconUri =
    getFragment(Token, !isUAddress(fragOrAddr) ? fragOrAddr : query?.token)?.icon ?? fallbackUri;

  if (!iconUri)
    return <UnknownTokenIcon {...imageProps} size={size} style={[style, styles.icon(size)]} />;

  return (
    <Image
      {...imageProps}
      source={{ uri: iconUri }}
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

// export const TokenIcon = TokenIcon_;
export const TokenIcon = withSuspense(
  memo(TokenIcon_, (prev, next) => deepEqual(normalizeProps(prev), normalizeProps(next))),
  ({ size }) => <CircleSkeleton size={size} />,
);

function normalizeProps(props: any) {
  if (typeof props.token !== 'object') return props;

  return {
    ...props,
    token: trimTokenIconTokenProp(props.token),
  };
}
