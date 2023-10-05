import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { materialCommunityIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Image, ImageProps } from 'expo-image';
import { Address, isAddress } from 'lib';
import { ImageStyle } from 'react-native';
import { CircleSkeleton } from '~/components/skeleton/CircleSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';

export const ETH_ICON_URI =
  'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png';
Image.prefetch(ETH_ICON_URI);

export const UnknownTokenIcon = materialCommunityIcon('help-circle-outline');

const Query = gql(/* GraphQL */ `
  query TokenIcon($token: Address!) {
    token(input: { address: $token }) {
      ...TokenIcon_token
    }
  }
`);

const Fragment = gql(/* GraphQL */ `
  fragment TokenIcon_token on Token {
    id
    iconUri
  }
`);

export interface TokenIconProps extends Omit<ImageProps, 'source' | 'style'> {
  token: FragmentType<typeof Fragment> | Address | null | undefined;
  fallbackUri?: string;
  size?: number;
  style?: ImageStyle;
}

export const TokenIcon = withSuspense(
  ({ token: tokenFragment, fallbackUri, size, style, ...imageProps }: TokenIconProps) => {
    const styles = useStyles(size);

    const query = useQuery(
      Query,
      { token: isAddress(tokenFragment) ? tokenFragment : '0x' },
      { pause: !isAddress(tokenFragment) },
    ).data;

    const iconUri =
      getFragment(Fragment, !isAddress(tokenFragment) ? tokenFragment : query?.token)?.iconUri ??
      fallbackUri;

    if (!iconUri)
      return <UnknownTokenIcon {...imageProps} size={size} style={[style, styles.icon]} />;

    return (
      <Image
        {...imageProps}
        source={{ uri: iconUri }}
        style={[style, styles.icon].filter(Boolean)}
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
