import { Box } from '@components/Box';
import { useDevice } from '@features/device/useDevice';
import { Paragraph, useTheme } from 'react-native-paper';
import { SharableAddr } from '@components/SharableAddr';
import { Item } from '@components/list/Item';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const DeviceIdItem = () => {
  const { colors, iconSize } = useTheme();
  const device = useDevice();

  return (
    <SharableAddr addr={device.address}>
      {({ value }) => (
        <Box vertical justifyContent="center" px={3} height={56}>
          <Item
            Left={
              <MaterialCommunityIcons
                name="wallet"
                size={iconSize.small}
                color={colors.onSurface}
              />
            }
            Main={
              <Paragraph style={{ color: colors.onSurface }}>{value}</Paragraph>
            }
          />
        </Box>
      )}
    </SharableAddr>
  );
};
