import { LogBox, Platform } from 'react-native';
import Jazzicon, { IJazziconProps } from 'react-native-jazzicon';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export const IDENTICON_SIZE = 40;

export type IdenticonProps = Omit<IJazziconProps, 'seed'> & {
  seed: string;
};

export const Identicon = ({ seed, ...props }: IdenticonProps) => {
  return <Jazzicon size={IDENTICON_SIZE} {...props} address={seed} />;
};
