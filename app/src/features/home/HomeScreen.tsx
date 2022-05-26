import { ScrollView } from 'react-native';

import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { Holdings } from './holdings/Holdings';
import { SafeBalance } from './SafeBalance';
import { HomeActions } from './actions/HomeActions';
import { SafeHeader } from '@features/safe/SafeHeader';

export type HomeScreenProps = RootStackScreenProps<'Home'>;

export const HomeScreen = (_props: HomeScreenProps) => (
  <Box flex={1} mt="5%">
    <ScrollView>
      <Box mx="5%">
        <SafeHeader />

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
  </Box>
);
