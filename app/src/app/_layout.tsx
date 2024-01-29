import '~/util/sentry/init';
import { getLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import { Suspense } from 'react';
import { IntlProvider } from 'react-intl';
import { Analytics } from '~/components/Analytics';
import { ErrorBoundary } from '~/components/ErrorBoundary/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MinimalErrorBoundary } from '~/components/ErrorBoundary/MinimalErrorBoundary';
import { Background } from '~/components/layout/Background';
import { Splash } from '~/components/Splash';
import { WalletConnectListeners } from '~/components/walletconnect/WalletConnectListeners';
import { GqlProvider } from '~/gql/GqlProvider';
import { AuthGate } from '~/components/provider/AuthGate';
import { NotificationsProvider } from '~/components/provider/NotificationsProvider';
import { SnackbarProvider } from '~/components/provider/SnackbarProvider';
import { UpdateProvider } from '~/components/provider/UpdateProvider';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { AppbarHeader } from '~/components/Appbar/AppbarHeader';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ApproverNameUpdater } from '~/components/ApproverNameUpdater';
import { Portal } from 'react-native-paper';
import { TQueryProvider } from '~/components/provider/TQueryProvider';
import { StyleSheet } from 'react-native';
import { Fonts } from '~/components/Fonts';

const modal: NativeStackNavigationOptions = {
  presentation: 'modal',
};

const transparentModal: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  headerShown: false,
  animation: 'fade',
  animationDuration: 100,
};

const sheet: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  headerShown: false,
  animation: 'fade',
  animationDuration: 0,
};

export const unstable_settings = {
  initialRouteName: `index`,
};

function Layout() {
  return (
    <Stack screenOptions={{ header: AppbarHeader }}>
      <Stack.Screen name={`(drawer)`} options={{ headerShown: false }} />
      <Stack.Screen name={`[account]/receive`} options={transparentModal} />
      <Stack.Screen name={`accounts/index`} options={sheet} />
      <Stack.Screen name={`approvers/[address]/qr`} options={transparentModal} />
      <Stack.Screen name={`ledger/approve`} options={sheet} />
      <Stack.Screen name={`link/token`} options={sheet} />
      <Stack.Screen name={`link/index`} options={transparentModal} />
      <Stack.Screen name={`onboard/(drawer)`} options={{ headerShown: false }} />
      <Stack.Screen name={`onboard/landing`} />
      <Stack.Screen name={`scan/[address]`} options={sheet} />
      <Stack.Screen name={`scan/index`} options={{ headerShown: false }} />
      <Stack.Screen name={`sessions/connect/[id]`} options={sheet} />
      <Stack.Screen name={`sessions/[topic]`} options={sheet} />
      <Stack.Screen name={`_sitemap`} />
      <Stack.Screen name={`+not-found`} />
      <Stack.Screen name={`addresses`} options={{ ...modal, headerShown: false }} />
      <Stack.Screen name={`auth`} options={transparentModal} />
      <Stack.Screen name={`confirm`} options={transparentModal} />
      <Stack.Screen name={`index`} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <MinimalErrorBoundary>
      <Fonts />
      <IntlProvider locale={getLocales()[0].languageTag} defaultLocale="en-US">
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.flex}>
            <ThemeProvider>
              <Background>
                <ErrorBoundary>
                  <Suspense fallback={<Splash />}>
                    <AuthGate>
                      <GqlProvider>
                        <TQueryProvider>
                          <ErrorBoundary>
                            <Suspense fallback={<Splash />}>
                              <Portal.Host>
                                <Layout />
                              </Portal.Host>
                            </Suspense>
                          </ErrorBoundary>
                          <MinimalErrorBoundary>
                            <Suspense fallback={null}>
                              <Analytics />
                              <WalletConnectListeners />
                              <NotificationsProvider />
                              <ApproverNameUpdater />
                            </Suspense>
                          </MinimalErrorBoundary>
                        </TQueryProvider>
                      </GqlProvider>
                    </AuthGate>
                  </Suspense>
                </ErrorBoundary>
              </Background>
              <SnackbarProvider />
              <UpdateProvider />
            </ThemeProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </IntlProvider>
    </MinimalErrorBoundary>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
