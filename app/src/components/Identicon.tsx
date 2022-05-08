import { BytesLike, ethers } from 'ethers';
import { isBytesLike } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { LogBox, Platform } from 'react-native';
import Jazzicon, { IJazziconProps } from 'react-native-jazzicon';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export const IDENTICON_SIZE = 40;

export type IdenticonProps = Omit<IJazziconProps, 'seed' | 'address'> & {
  seed: number | string | BytesLike;
};

export const Identicon = ({ seed: input, ...props }: IdenticonProps) => {
  const seed = useMemo(() => {
    if (typeof input === 'number') return input;

    if (isBytesLike(input)) input = ethers.utils.hexlify(input);

    if (!ethers.utils.isHexString(input))
      throw new Error(`Unimplemented: non-hex string seed for Identicon`);

    return parseInt(input.slice(2, 10), 16);
  }, [input]);

  return <Jazzicon size={IDENTICON_SIZE} {...props} seed={seed} />;
};
