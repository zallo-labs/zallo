import { ICON_SIZE } from '@theme/paper';
import { Address, UAddress, asAddress, asChain, isUAddress } from 'lib';
import { ImageStyle, StyleProp, View } from 'react-native';
import { Blockie } from './Blockie';
import { memo, useMemo } from 'react';
import { createStyles } from '@theme/styles';
import { ChainIcon } from './ChainIcon';

export interface AddressIconProps {
  address: Address | UAddress;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

function AddressIcon_({ address, size = ICON_SIZE.medium, style }: AddressIconProps) {
  const chain = useMemo(() => (isUAddress(address) ? asChain(address) : undefined), [address]);
  const seed = useMemo(() => asAddress(address), [address]);

  return (
    <View>
      <Blockie seed={seed} size={size} style={style} />
      {chain && <ChainIcon chain={chain} style={styles.chain(size)} />}
    </View>
  );
}

const styles = createStyles({
  chain: (size: number) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: -size,
    width: (size * 10) / 24,
    height: (size * 10) / 24,
  }),
});

export const AddressIcon = memo(AddressIcon_);
