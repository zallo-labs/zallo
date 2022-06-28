import { ScrollView } from 'react-native';
import { Box } from '@components/Box';
import { Holdings } from './holdings/Holdings';
import { SafeBalance } from './SafeBalance';
import { HomeActions } from './actions/HomeActions';
import { TabNavigatorScreenProps } from '@features/navigation/TabNavigator';
import { HomeAppbar } from './HomeAppbar';
import { Portal } from 'react-native-paper';

export type HomeScreenProps = TabNavigatorScreenProps<'Home'>;

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
