import { useMemo } from 'react';
import { LogBox, Platform } from 'react-native';
import Jazzicon from 'react-native-jazzicon';
import { Address } from 'lib';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export interface IdenticonProps {
  addr: Address;
  size?: number;
}

export const Identicon = ({ addr, size = 40 }: IdenticonProps) => {
  const seed = useMemo(() => parseFloat(addr.slice(2)), [addr]);

  return <Jazzicon size={size} seed={seed} />;
};
