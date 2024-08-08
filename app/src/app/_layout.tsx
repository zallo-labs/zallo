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
import { AuthGate } from '#/provider/AuthGate';
import { ApiProvider } from '~/api/ApiProvider';
import { NotificationsProvider } from '#/provider/NotificationsProvider';
import { SnackbarProvider } from '#/provider/SnackbarProvider';
import { UpdateProvider } from '#/provider/UpdateProvider';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Portal as RnpPortal } from 'react-native-paper';
import { TQueryProvider } from '#/provider/TQueryProvider';
import { StyleSheet } from 'react-native';
import { Fonts } from '#/Fonts';
import { SentryProvider } from '#/provider/SentryProvider';
import { GoogleAuthProvider } from '#/cloud/google/GoogleAuthProvider';
import { Try } from 'expo-router/build/views/Try';
import { PortalProvider } from '@gorhom/portal';
import { GlobalSubscriptions } from '#/GlobalSubscriptions/GlobalSubscriptions';
import { createStyles, useStyles } from '@theme/styles';

export const unstable_settings = {
  initialRouteName: `index`,
};

function Layout() {
  const { styles } = useStyles(stylesheet);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.stackContent,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name={`(modal)`}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          animationDuration: 100,
          contentStyle: styles.transparentContent,
        }}
      />
      <Stack.Screen
        name={`(sheet)`}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          animationDuration: 100,
          contentStyle: styles.transparentContent,
        }}
      />
    </Stack>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  stackContent: {
    backgroundColor: colors.surface,
  },
  transparentContent: {},
}));

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
                    <Suspense fallback={<Splash />}>
                      <ApiProvider>
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
                            <Try catch={IgnoredErrorBoundary}>
                              <Suspense fallback={null}>
                                <UpdateProvider />
                                <Analytics />
                                <WalletConnectListeners />
                                <GlobalSubscriptions />
                                <NotificationsProvider />
                              </Suspense>
                            </Try>
                          </GoogleAuthProvider>
                        </TQueryProvider>
                      </ApiProvider>
                    </Suspense>
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
