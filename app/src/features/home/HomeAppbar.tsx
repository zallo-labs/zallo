import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { useSafe } from '@features/safe/SafeProvider';
import { SafeSelectorDialog } from '@features/safe/selector/SafeSelectorDialog';
import { useNavigation } from '@react-navigation/native';
import { ScanIcon } from '@util/theme/icons';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Appbar, Portal, Title } from 'react-native-paper';
import { HomeScreenProps } from './HomeScreen';

export const HomeAppbar = () => {
  const { contract: safe } = useSafe();
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      {/* TODO: MD3 - mode="center-aligned" */}
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={navigation.openDrawer} />

        <Box flex={1} horizontal justifyContent="center" mx={3}>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Title>
              <Addr addr={safe.address} />
            </Title>
          </TouchableOpacity>
        </Box>

        <Appbar.Action
          icon={ScanIcon}
          onPress={() => {
            // TODO: implement
            navigation.navigate('QrScanner', {
              target: {
                route: 'SelectToken',
                output: 'to',
                target: {
                  route: 'Send',
                  output: 'token',
                },
              },
            });
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
