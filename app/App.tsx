import 'node-libs-react-native/globals';
import '~/util/network/provider';
import '~/util/immer';

import { Suspense } from 'react';
import { StyleSheet } from 'react-native';
import { RecoilRoot } from 'recoil';
import { Background } from '~/components/layout/Background';
import { LocalizatonProvider } from '~/provider/LocalizationProvider';
import { GqlProvider } from '~/gql/GqlProvider';
import { SnackbarProvider } from '~/provider/SnackbarProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '~/util/sentry/ErrorBoundary';
import { Splash } from '~/components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '~/provider/AuthGate';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { SentryUser } from '~/util/sentry/SentryUser';
import { withSentry } from '~/util/sentry/sentry';
import { NavigationProvider } from '~/navigation/NavigationProvider';
import { NotificationsRegistrar } from '~/util/NotificationsRegistrar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DrawerNavigator } from '~/navigation/Drawer/DrawerNavigator';
import { WalletConnectListeners } from '~/components/walletconnect/WalletConnectListeners';

export default withSentry(() => (
  <LocalizatonProvider>
    <SafeAreaProvider>
      <ThemeProvider>
        <Background>
          <StatusBar style="light" backgroundColor="transparent" />
          <GestureHandlerRootView style={styles.flexed}>
            <ErrorBoundary>
              <Suspense fallback={<Splash />}>
                <RecoilRoot>
                  <AuthGate>
                    <SentryUser />
                    <GqlProvider>
                      <NotificationsRegistrar />
                      <NavigationProvider>
                        <WalletConnectListeners />
                        <Suspense fallback={<Splash />}>
                          <DrawerNavigator />
                        </Suspense>
                      </NavigationProvider>
                    </GqlProvider>
                  </AuthGate>
                  <SnackbarProvider />
                </RecoilRoot>
              </Suspense>
            </ErrorBoundary>
          </GestureHandlerRootView>
        </Background>
      </ThemeProvider>
    </SafeAreaProvider>
  </LocalizatonProvider>
));

const styles = StyleSheet.create({
  flexed: {
    flex: 1,
  },
});
