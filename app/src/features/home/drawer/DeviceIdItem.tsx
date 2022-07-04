import { Box } from '@components/Box';
import { useWallet } from '@features/wallet/useWallet';
import { Paragraph, useTheme } from 'react-native-paper';
import { SharableAddr } from '@components/SharableAddr';
import { Item } from '@components/list/Item';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const DeviceIdItem = () => {
  const { colors, iconSize } = useTheme();
  const wallet = useWallet();

  return (
    <SharableAddr addr={wallet.address}>
      {({ value }) => (
        <Box vertical justifyContent="center" px={3} height={56}>
          <Item
            Left={
              <MaterialCommunityIcons
                name="account"
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
