import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Chevron } from '@components/Chevron';
import { useSafe } from '@features/safe/SafeProvider';
import { SafeSelectorDialog } from '@features/safe/selector/SafeSelectorDialog';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Appbar, Portal, Title, useTheme } from 'react-native-paper';

export const HomeAppbar = () => {
  const { colors } = useTheme();
  const { safe } = useSafe();

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      {/* TODO: MD3 - mode="center-aligned" */}
      <Appbar.Header>
        <Appbar.Action
          icon="menu"
          onPress={() => {
            // TODO: implement
          }}
        />

        <Box flex={1} mx={3}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Box horizontal justifyContent="center" alignItems="center">
              <Title numberOfLines={1}>
                <Addr addr={safe.address} />
              </Title>

              <Chevron
                expanded={menuVisible}
                color={colors.onSurface}
                size={20}
              />
            </Box>
          </TouchableOpacity>
        </Box>

        <Appbar.Action
          icon="line-scan"
          onPress={() => {
            // TODO: implement
          }}
        />
      </Appbar.Header>

      <Portal>
        <SafeSelectorDialog
          visible={menuVisible}
          hide={() => setMenuVisible(false)}
        />
      </Portal>
    </>
  );
};
