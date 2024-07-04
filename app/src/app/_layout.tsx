import * as Sentry from '@sentry/react-native';
import { getLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import { Suspense } from 'react';
import { IntlProvider } from 'react-intl';
import { Analytics } from '#/Analytics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Background } from '#/layout/Background';
import { RootErrorBoundary, IgnoredErrorBoundary } from '#/ErrorBoundary';
import { Splash } from '#/Splash';
import { WalletConnectListeners } from '#/walletconnect/WalletConnectListeners';
import { GqlProvider } from '~/gql/GqlProvider';
import { AuthGate } from '#/provider/AuthGate';
import { ApiProvider } from '~/api/ApiProvider';
import { NotificationsProvider } from '#/provider/NotificationsProvider';
import { SnackbarProvider } from '#/provider/SnackbarProvider';
import { UpdateProvider } from '#/provider/UpdateProvider';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { AppbarHeader } from '#/Appbar/AppbarHeader';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Portal as RnpPortal } from 'react-native-paper';
import { TQueryProvider } from '#/provider/TQueryProvider';
import { StyleSheet } from 'react-native';
import { Fonts } from '#/Fonts';
import { SentryProvider } from '#/provider/SentryProvider';
import { GoogleAuthProvider } from '#/cloud/google/GoogleAuthProvider';
import { Try } from 'expo-router/build/views/Try';
import { PortalProvider } from '@gorhom/portal';
import { GlobalSubscriptions } from '#/GlobalSubscriptions';

export const unstable_settings = {
  initialRouteName: `index`,
};

function Layout() {
  return (
    <Stack screenOptions={{ header: (props) => <AppbarHeader {...props} /> }}>
      <Stack.Screen name={`(nav)`} options={{ headerShown: false }} />
      <Stack.Screen name={`onboard`} options={{ headerShown: false }} />
      <Stack.Screen name={`_sitemap`} />
      <Stack.Screen name={`+not-found`} />
      <Stack.Screen name={`index`} options={{ headerShown: false }} />
      <Stack.Screen name={`scan`} options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Fonts />
        <SentryProvider />
        <Try catch={RootErrorBoundary}>
          <IntlProvider locale={getLocales()?.[0]?.languageTag ?? 'en-US'} defaultLocale="en-US">
            <GestureHandlerRootView style={styles.flex}>
              <Background>
                <Suspense fallback={<Splash />}>
                  <AuthGate>
                    <ApiProvider>
                      <GqlProvider>
                        <TQueryProvider>
                          <GoogleAuthProvider>
                            <Try catch={RootErrorBoundary}>
                              <Suspense fallback={<Splash />}>
                                <RnpPortal.Host>
                                  <PortalProvider>
                                    <Layout />
                                  </PortalProvider>
                                </RnpPortal.Host>
                              </Suspense>
                            </Try>
                            {/* <Try catch={IgnoredErrorBoundary}>
                              <Suspense fallback={null}>
                                <UpdateProvider />
                                <Analytics />
                                <WalletConnectListeners />
                                <GlobalSubscriptions />
                                <NotificationsProvider />
                              </Suspense>
                            </Try> */}
                          </GoogleAuthProvider>
                        </TQueryProvider>
                      </GqlProvider>
                    </ApiProvider>
                  </AuthGate>
                </Suspense>
              </Background>
              <SnackbarProvider />
            </GestureHandlerRootView>
          </IntlProvider>
        </Try>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
