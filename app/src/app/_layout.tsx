import * as Sentry from '@sentry/react-native';
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
import { ApproverNameUpdater } from '~/components/ApproverNameUpdater';
import { Portal } from 'react-native-paper';
import { TQueryProvider } from '~/components/provider/TQueryProvider';
import { StyleSheet } from 'react-native';
import { Fonts } from '~/components/Fonts';
import { SentryProvider } from '~/components/provider/SentryProvider';

export const unstable_settings = {
  initialRouteName: `index`,
};

function Layout() {
  return (
    <Stack screenOptions={{ header: AppbarHeader }}>
      <Stack.Screen name={`(drawer)`} options={{ headerShown: false }} />
      <Stack.Screen name={`onboard`} options={{ headerShown: false }} />
      <Stack.Screen name={`_sitemap`} />
      <Stack.Screen name={`+not-found`} />
      <Stack.Screen name={`hello`} />
      <Stack.Screen name={`index`} />
      <Stack.Screen name={`scan`} options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayout() {
  return (
    <MinimalErrorBoundary>
      <SentryProvider />
      <Fonts />
      <IntlProvider locale={getLocales()?.[0]?.languageTag ?? 'en-US'} defaultLocale="en-US">
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

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
