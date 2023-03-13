import { DeviceIcon } from '@theme/icons';
import { Share } from 'react-native';
import { Drawer } from 'react-native-paper';
import { useUser } from '@api/user';
import { truncateAddr } from '~/util/format';

export const DeviceItem = () => {
  const user = useUser();

  return (
    <Drawer.Item
      label={`Device: ${truncateAddr(user.id)}`}
      icon={DeviceIcon}
      onPress={() =>
        Share.share({
          title: 'Device ID',
          message: user.id,
        })
      }
    />
  );
};
