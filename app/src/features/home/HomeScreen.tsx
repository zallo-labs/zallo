import { ScrollView } from 'react-native';

import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { Holdings } from './holdings/Holdings';
import { SafeBalance } from './SafeBalance';
import { HomeActions } from './actions/HomeActions';
import { SafeIcon } from './SafeIcon';

export type HomeScreenProps = RootStackScreenProps<'Home'>;

export const HomeScreen = (_props: HomeScreenProps) => (
  <Box flex={1}>
    <ScrollView>
      <Box horizontal justifyContent="flex-end" mt="5%" mr="5%">
        <SafeIcon />
      </Box>

      <Box center my="15%">
        <Box mb={4}>
          <SafeBalance />
        </Box>

        <HomeActions />
      </Box>

      <Box>
        <Holdings />
      </Box>
    </ScrollView>
  </Box>
);
