import '~/util/patches';

import { Suspense } from 'react';
import { StyleSheet } from 'react-native';
import { RecoilEnv, RecoilRoot } from 'recoil';
import { Background } from '~/components/layout/Background';
import { LocalizatonProvider } from '~/provider/LocalizationProvider';
import { GqlProvider } from '~/gql/GqlProvider';
import { SnackbarProvider } from '~/provider/SnackbarProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '~/components/ErrorBoundary/ErrorBoundary';
import { Splash } from '~/components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '~/provider/AuthGate';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { AnalyticsUser } from '~/components/AnalyticsUser';
import { NavigationProvider } from '~/navigation/NavigationProvider';
import { NotificationsRegistrar } from '~/components/NotificationsRegistrar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StackNavigator } from '~/navigation/StackNavigator';
import { Subscriptions } from './components/Subscriptions';
import { SentryProvider } from './provider/SentryProvider';
import { WalletConnectListeners } from '~/components/walletconnect/WalletConnectListeners';
import { UpdateProvider } from './provider/UpdateProvider';
import * as SplashScreen from 'expo-splash-screen';
import { HideSplash } from './components/HideSplash';

// Disable Recoil atom key checking due to hotreloading issues
RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;

SplashScreen.preventAutoHideAsync();

export default () => (
  <SentryProvider>
    <ErrorBoundary fallback={<Splash />}>
      <LocalizatonProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <SnackbarProvider />
            <Background>
              <StatusBar backgroundColor="transparent" />
              <GestureHandlerRootView style={styles.flex}>
                <RecoilRoot>
                  <ErrorBoundary>
                    <Suspense fallback={<Splash />}>
                      <AuthGate>
                        <GqlProvider>
                          <NavigationProvider>
                            <ErrorBoundary>
                              <Suspense fallback={<Splash />}>
                                <StackNavigator />
                              </Suspense>
                            </ErrorBoundary>
                            <ErrorBoundary fallback={undefined}>
                              <Suspense fallback={null}>
                                <AnalyticsUser />
                                <WalletConnectListeners />
                                <HideSplash />
                                <Subscriptions />
                                <NotificationsRegistrar />
                                <UpdateProvider />
                              </Suspense>
                            </ErrorBoundary>
                          </NavigationProvider>
                        </GqlProvider>
                      </AuthGate>
                    </Suspense>
                  </ErrorBoundary>
                </RecoilRoot>
              </GestureHandlerRootView>
            </Background>
          </ThemeProvider>
        </SafeAreaProvider>
      </LocalizatonProvider>
    </ErrorBoundary>
  </SentryProvider>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
