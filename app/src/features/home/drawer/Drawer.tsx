import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { withProposeProvider } from '@features/execute/ProposeProvider';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { ActivityIcon, ContactsIcon, HomeIcon } from '@util/theme/icons';
import { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Drawer as PaperDrawer } from 'react-native-paper';
import { useAccountAreaInsets } from 'react-native-safe-area-context';
import { DeviceIdItem } from './DeviceIdItem';
import { DrawerGroupsSection } from './DrawerGroupsSection';
import { DrawerLink } from './DrawerLink';
import {
  DrawerNavigate,
  DrawerNavigationProvider,
} from './DrawerNavigationProvider';

export interface DrawerProps extends DrawerContentComponentProps {}

export const Drawer = ({ navigation }: DrawerProps) => {
  const insets = useAccountAreaInsets();

  const navigate: DrawerNavigate = useCallback(
    (...params: Parameters<DrawerNavigate>) => {
      navigation.navigate(...params);
      navigation.closeDrawer();
    },
    [navigation],
  );

  return (
    <DrawerNavigationProvider navigate={navigate}>
      <Box
        flex={1}
        surface
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <ScrollView>
          <PaperDrawer.Section title="MetaAccount">
            {/* Drawer is only visible on Home screen so it's always active */}
            <DrawerLink screen="Home" icon={HomeIcon} active />
            <DrawerLink screen="Activity" icon={ActivityIcon} />
            <DrawerLink screen="Contacts" icon={ContactsIcon} />
          </PaperDrawer.Section>

          <DrawerGroupsSection />
        </ScrollView>

        <Divider mx={2} />
        <DeviceIdItem />
        {/* <DrawerLink screen="Settings" icon="settings" /> */}
      </Box>
    </DrawerNavigationProvider>
  );
};
