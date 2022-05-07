import { useMemo } from 'react';
import { LogBox, Platform } from 'react-native';
import Jazzicon, { IJazziconProps } from 'react-native-jazzicon';
import { isHexString } from 'ethers/lib/utils';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export type IdenticonProps = Omit<IJazziconProps, 'seed'> & {
  seed: string;
};

export const Identicon = ({ seed, ...props }: IdenticonProps) => {
  const parsedSeed = useMemo(
    () => parseFloat(isHexString(seed) ? seed.slice(2) : seed),
    [seed],
  );

  return <Jazzicon size={40} {...props} seed={parsedSeed} />;
};
