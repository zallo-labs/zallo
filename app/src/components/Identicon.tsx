import { useMemo } from 'react';
import { LogBox, Platform } from 'react-native';
import Jazzicon, { IJazziconProps } from 'react-native-jazzicon';
import { Address } from 'lib';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export type IdenticonProps = Omit<IJazziconProps, 'seed'> & {
  addr: Address;
};

export const Identicon = ({ addr, ...props }: IdenticonProps) => {
  const seed = useMemo(() => parseFloat(addr.slice(2)), [addr]);

  return <Jazzicon size={40} {...props} seed={seed} />;
};
