import { ScrollView } from 'react-native';

import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { Holdings } from './holdings/Holdings';
import { SafeTitle } from './SafeTitle';
import { SafeBalance } from './SafeBalance';
import { HomeActions } from './HomeActions';

export type HomeScreenProps = RootStackScreenProps<'Home'>;

export const HomeScreen = (_props: HomeScreenProps) => (
  <Box flex={1}>
    <ScrollView>
      <Box center mt="5%">
        <SafeTitle />
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
