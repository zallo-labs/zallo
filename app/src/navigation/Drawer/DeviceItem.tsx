import { useDevice } from '@network/useDevice';
import { DeviceIcon } from '@theme/icons';
import { Share } from 'react-native';
import { Drawer } from 'react-native-paper';
import { truncateAddr } from '~/util/format';

export const DeviceItem = () => {
  const device = useDevice();

  return (
    <Drawer.Item
      label={`Device: ${truncateAddr(device.address)}`}
      icon={DeviceIcon}
      onPress={() =>
        Share.share({
          title: 'Device ID',
          message: device.address,
        })
      }
    />
  );
};
