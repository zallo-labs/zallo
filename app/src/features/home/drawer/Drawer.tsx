import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { ActivityIcon, ContactsIcon, HomeIcon } from '@util/icons';
import { createContext, useCallback, useContext } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Drawer as PaperDrawer } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreenProps } from '../HomeScreen';
import { DeviceIdItem } from './DeviceIdItem';
import { DrawerGroupsSection } from './DrawerGroupsSection';
import { DrawerLink } from './DrawerLink';

export type DrawerNavigation = HomeScreenProps['navigation']['navigate'];

const context = createContext<DrawerNavigation>(() => {
  throw new Error('Drawer context not initialized');
});

export const useDrawerNavigation = () => useContext(context);

export interface DrawerProps extends DrawerContentComponentProps {}

export const Drawer = ({ navigation }: DrawerProps) => {
  const insets = useSafeAreaInsets();

  const navigate: DrawerNavigation = useCallback(
    (...params: Parameters<DrawerNavigation>) => {
      navigation.navigate(...params);
      navigation.closeDrawer();
    },
    [navigation],
  );

  return (
    <context.Provider value={navigate}>
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
          <PaperDrawer.Section title="MetaSafe">
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
    </context.Provider>
  );
};
