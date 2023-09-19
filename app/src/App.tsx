import '~/util/patches';

import { Suspense } from 'react';
import { StyleSheet } from 'react-native';
import { Background } from '~/components/layout/Background';
import { LocalizatonProvider } from '~/provider/LocalizationProvider';
import { GqlProvider } from '~/gql/GqlProvider';
import { SnackbarProvider } from '~/provider/SnackbarProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MinimalErrorBoundary } from '~/components/ErrorBoundary/MinimalErrorBoundary';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Splash } from '~/components/Splash';
import { AuthGate } from '~/provider/AuthGate';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { AnalyticsUser } from '~/components/AnalyticsUser';
import { NavigationProvider } from '~/navigation/NavigationProvider';
import { NotificationsRegistrar } from '~/components/NotificationsRegistrar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StackNavigator } from '~/navigation/StackNavigator';
import { SentryProvider } from './provider/SentryProvider';
import { WalletConnectListeners } from '~/components/walletconnect/WalletConnectListeners';
import { UpdateProvider } from './provider/UpdateProvider';
import * as SplashScreen from 'expo-splash-screen';
import { HideSplash } from './components/HideSplash';

SplashScreen.preventAutoHideAsync();

export default () => (
  <SentryProvider>
    <MinimalErrorBoundary fallback={<Splash />}>
      <LocalizatonProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <Background>
              <GestureHandlerRootView style={styles.flex}>
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
                          <MinimalErrorBoundary>
                            <Suspense fallback={null}>
                              <AnalyticsUser />
                              <WalletConnectListeners />
                              <HideSplash />
                              <NotificationsRegistrar />
                            </Suspense>
                          </MinimalErrorBoundary>
                        </NavigationProvider>
                      </GqlProvider>
                    </AuthGate>
                  </Suspense>
                </ErrorBoundary>
              </GestureHandlerRootView>
            </Background>
            <SnackbarProvider />
            <UpdateProvider />
          </ThemeProvider>
        </SafeAreaProvider>
      </LocalizatonProvider>
    </MinimalErrorBoundary>
  </SentryProvider>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
