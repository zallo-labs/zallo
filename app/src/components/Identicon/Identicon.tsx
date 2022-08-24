import { BytesLike, ethers } from 'ethers';
import { hexlify, isBytesLike } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { LogBox, Platform } from 'react-native';
import Jazzicon, { IJazziconProps } from 'react-native-jazzicon';
import { useTheme } from 'react-native-paper';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export type IdenticonProps = Omit<IJazziconProps, 'seed' | 'address'> & {
  seed: number | string | BytesLike;
};

export const Identicon = ({ seed: input, ...props }: IdenticonProps) => {
  const { iconSize } = useTheme();

  const seed = useMemo(() => {
    let value = input;
    if (typeof value === 'number') return value;

    if (isBytesLike(value)) value = hexlify(value);

    if (!ethers.utils.isHexString(value)) {
      throw new Error(
        `Unimplemented - non-hex string seed for Identicon: ${value}`,
      );
    }

    return parseInt(value.slice(2, 10), 16);
  }, [input]);

  return <Jazzicon size={iconSize.medium} {...props} seed={seed} />;
};
