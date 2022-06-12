import { useAddrName } from '@util/hook/useAddrName';
import { BytesLike, ethers } from 'ethers';
import { hexlify, isBytesLike } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { LogBox, Platform } from 'react-native';
import Jazzicon, { IJazziconProps } from 'react-native-jazzicon';
import { LabelIcon } from './LabelIcon';
import { PRIMARY_ICON_SIZE } from './list/Item';
import { isAddress } from 'lib';

// react-native-jazzicon causes a warning; see https://github.com/stanislaw-glogowski/react-native-jazzicon/pull/1
if (Platform.OS !== 'web')
  LogBox.ignoreLogs(['componentWillReceiveProps has been renamed']);

export type IdenticonProps = Omit<IJazziconProps, 'seed' | 'address'> & {
  seed: number | string | BytesLike;
};

export const Identicon = ({ seed: input, ...props }: IdenticonProps) => {
  const name =
    typeof input === 'string' && isAddress(input) ? useAddrName(input) : null;

  const seed = useMemo(() => {
    if (typeof input === 'number') return input;

    if (isBytesLike(input)) input = hexlify(input);

    if (!ethers.utils.isHexString(input)) {
      throw new Error(
        `Unimplemented - non-hex string seed for Identicon: ${input}`,
      );
    }

    return parseInt(input.slice(2, 10), 16);
  }, [input]);

  if (name) return <LabelIcon label={name} />;

  return <Jazzicon size={PRIMARY_ICON_SIZE} {...props} seed={seed} />;
};
