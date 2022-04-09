import { ScrollView } from 'react-native';

import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { SafeQr } from '@features/safe/SafeQr';
import { Holdings } from './Holdings';
import { SafeTitle } from './SafeTitle';

export type HomeScreenProps = RootStackScreenProps<'Home'>;

export const HomeScreen = (_props: HomeScreenProps) => (
  <Box flex={1}>
    <ScrollView>
      <Box center mt="5%">
        <SafeTitle />
      </Box>

      <Box center my="15%">
        <SafeQr />
      </Box>

      <Box>
        <Holdings />
      </Box>
    </ScrollView>
  </Box>
);
