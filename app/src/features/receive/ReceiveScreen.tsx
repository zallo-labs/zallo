import { Share } from 'react-native';
import { FAB, Subheading, Title } from 'react-native-paper';
import { useKeepAwake } from 'expo-keep-awake';

import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { SafeQr } from '@features/receive/SafeQr';
import { useSafe } from '@features/safe/SafeProvider';
import { FormattedAddr } from '@components/FormattedAddr';
import { useMaxBrighness } from './useMaxBrightness';
import { ExpandableAddr } from '@components/ExpandableAddr';

export type ReceiveScreenProps = RootStackScreenProps<'Receive'>;

export const ReceiveScreen = (_props: ReceiveScreenProps) => {
  const safe = useSafe();
  useMaxBrighness();
  useKeepAwake();

  const share = () =>
    Share.share({
      message: safe.contract.address,
      url: safe.contract.address,
    });

  return (
    <Box flex={1} vertical justifyContent="space-around" alignItems="center" mx={4}>
      <Box flex={3} center>
        <SafeQr />
      </Box>

      <Box flex={1}>
        <ExpandableAddr addr={safe.contract.address}>
          {({ children }) => <Title>{children}</Title>}
        </ExpandableAddr>
      </Box>

      <Box alignSelf="flex-end" mb={4}>
        <FAB icon="share" label="Share" onPress={share} />
      </Box>
    </Box>
  );
};
