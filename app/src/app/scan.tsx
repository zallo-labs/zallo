import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from 'react-native-paper';
import { Actions } from '#/layout/Actions';
import { Address, UAddress, tryAsAddress } from 'lib';
import * as Linking from 'expo-linking';
import useAsyncEffect from 'use-async-effect';
import { showError } from '#/provider/SnackbarProvider';
import { parseAppLink } from '~/lib/appLink';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScanOverlay } from '#/ScanOverlay';
import { Subject } from 'rxjs';
import { useGetEvent } from '~/hooks/useGetEvent';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { z } from 'zod';
import { zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { isWalletConnectUri } from '~/lib/wc/uri';
import { Button } from '#/Button';

const SCANNED_ADDRESSES = new Subject<Address>();
export function useScanAddress() {
  const getEvent = useGetEvent();

  return (account?: UAddress) =>
    getEvent({ pathname: `/scan/`, params: { ...(account && { account }) } }, SCANNED_ADDRESSES);
}

const ScanScreenParams = z.object({ account: zUAddress().optional() });

export default function ScanScreen() {
  const { account } = useLocalParams(ScanScreenParams);
  const router = useRouter();

  const [scan, setScan] = useState(true);

  useFocusEffect(useCallback(() => setScan(true), [setScan]));

  const tryHandle = async (data: string) => {
    setScan(false);

    const address = tryAsAddress(data);
    if (address) {
      if (SCANNED_ADDRESSES.observed) {
        SCANNED_ADDRESSES.next(address);
      } else {
        router.replace({
          pathname: `/(sheet)/scan/[address]`,
          params: { address, ...(account && { account }) },
        });
      }
      return true;
    } else if (isWalletConnectUri(data)) {
      try {
        router.replace({ pathname: '/wc', params: { uri: data } });
        return true;
      } catch {
        showError('Failed to connect. Please refresh the DApp and try again');
      }
    } else if (parseAppLink(data)) {
      router.replace(parseAppLink(data)!);
      return true;
    }

    setScan(true);
    return false;
  };

  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useAsyncEffect(
    async (isMounted) => {
      if (!permission?.granted) {
        await requestPermission();
        if (isMounted()) setPermissionsRequested(true);
      }
    },
    [requestPermission],
  );

  return permission?.granted || !permissionsRequested ? (
    <CameraView
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={scan ? ({ data }) => tryHandle(data) : undefined}
      style={StyleSheet.absoluteFillObject}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScanOverlay onData={tryHandle} />
    </CameraView>
  ) : (
    <View style={styles.grantContainer}>
      <Stack.Screen options={{ headerShown: true }} />
      <AppbarOptions headline="Camera permission required" />

      <Text variant="headlineMedium" style={styles.grantText}>
        Please grant camera permissions in order to scan a QR code
      </Text>

      <Actions>
        {Platform.OS !== 'web' && (
          <Button
            mode="contained"
            onPress={async () => {
              await Linking.openSettings();
              requestPermission();
            }}
          >
            Open app settings
          </Button>
        )}
      </Actions>
    </View>
  );
}

const styles = StyleSheet.create({
  grantContainer: {
    flex: 1,
  },
  grantText: {
    textAlign: 'center',
    marginHorizontal: 16,
    marginVertical: 32,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});

export { ErrorBoundary } from '#/ErrorBoundary';
