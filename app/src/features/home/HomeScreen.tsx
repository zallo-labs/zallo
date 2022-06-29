import { ScrollView } from 'react-native';
import { Box } from '@components/Box';
import { Holdings } from './holdings/Holdings';
import { SafeBalance } from './SafeBalance';
import { HomeActions } from './actions/HomeActions';
import { HomeAppbar } from './HomeAppbar';
import { Portal } from 'react-native-paper';
import { DrawerNavigatorScreenProps } from '@features/navigation/DrawerNavigator';

export type HomeScreenProps = DrawerNavigatorScreenProps<'Home'>;

export const HomeScreen = (_props: HomeScreenProps) => {
  return (
    <Box flex={1}>
      <Portal.Host>
        <HomeAppbar />

        <ScrollView>
          <Box mx="5%">
            <Box center my="15%">
              <Box mb={4}>
                <SafeBalance />
              </Box>

              <HomeActions />
            </Box>
          </Box>

          <Box>
            <Holdings />
          </Box>
        </ScrollView>
      </Portal.Host>
    </Box>
  );
};
