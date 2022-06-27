import { Share } from 'react-native';
import { Appbar, FAB, Title } from 'react-native-paper';
import { useKeepAwake } from 'expo-keep-awake';

import { Box } from '@components/Box';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { QrCode } from '@features/qr/QrCode';
import { useSafe } from '@features/safe/SafeProvider';
import { useMaxBrighness } from './useMaxBrightness';
import { AppbarRoot } from '@components/AppbarRoot';
import { AppbarBack } from '@components/AppbarBack';

export type ReceiveScreenProps = RootNavigatorScreenProps<'Receive'>;

export const ReceiveScreen = (_props: ReceiveScreenProps) => {
  const { safe } = useSafe();
  useMaxBrighness();
  useKeepAwake();

  const share = () =>
    Share.share({
      message: safe.address,
      url: safe.address,
    });

  return (
    <Box flex={1}>
      <AppbarRoot>
        <AppbarBack />
        <Appbar.Content title="Receive" />
      </AppbarRoot>

      <Box
        flex={1}
        vertical
        justifyContent="space-around"
        alignItems="center"
        mx={4}
      >
        <Box flex={3} center>
          <QrCode addr={safe.address} />
        </Box>

        <Box flex={1}>
          <Title style={{ textAlign: 'center', opacity: 0.8 }}>
            {safe.address}
          </Title>
        </Box>

        <Box alignSelf="flex-end" mb={4}>
          <FAB icon="share-variant" label="Share" onPress={share} />
        </Box>
      </Box>
    </Box>
  );
};
