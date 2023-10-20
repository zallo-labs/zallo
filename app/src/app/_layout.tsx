import '~/util/sentry/init';
import { locale } from 'expo-localization';
import { Stack } from 'expo-router';
import { Suspense } from 'react';
import { IntlProvider } from 'react-intl';
import { Analytics } from '~/components/Analytics';
import { ErrorBoundary } from '~/components/ErrorBoundary/ErrorBoundary';
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

const modal: NativeStackNavigationOptions = {
  presentation: 'modal',
};

const transparentModal: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  headerShown: false,
};

export const unstable_settings = {
  initialRouteName: `index`,
};

function Layout() {
  return (
    <Stack screenOptions={{ header: AppbarHeader }}>
      <Stack.Screen name={`(drawer)`} options={{ headerShown: false }} />
      <Stack.Screen name={`[account]/policies/[key]/[contract]/add-selector`} options={modal} />
      <Stack.Screen name={`[account]/policies/[key]/name`} options={modal} />
      <Stack.Screen name={`[account]/policies/template`} options={modal} />
      <Stack.Screen name={`[account]/name`} options={modal} />
      <Stack.Screen name={`[account]/receive`} options={transparentModal} />
      <Stack.Screen name={`accounts/create`} options={modal} />
      <Stack.Screen name={`accounts/index`} options={transparentModal} />
      <Stack.Screen name={`approver/[address]/qr`} options={transparentModal} />
      <Stack.Screen name={`ledger/sign`} options={transparentModal} />
      <Stack.Screen name={`link/token`} options={transparentModal} />
      <Stack.Screen name={`link/index`} options={transparentModal} />
      <Stack.Screen name={`onboard/approver`} />
      <Stack.Screen name={`onboard/auth`} />
      <Stack.Screen name={`onboard/index`} />
      <Stack.Screen name={`onboard/notifications`} />
      <Stack.Screen name={`onboard/user`} options={modal} />
      <Stack.Screen name={`scan/[address]`} options={transparentModal} />
      <Stack.Screen name={`scan/index`} options={{ headerShown: false }} />
      <Stack.Screen name={`sessions/connect/[id]`} options={transparentModal} />
      <Stack.Screen name={`sessions/[topic]`} options={transparentModal} />
      <Stack.Screen name={`[...unmatched]`} />
      <Stack.Screen name={`addresses`} options={{ ...modal, headerShown: false }} />
      <Stack.Screen name={`confirm`} options={transparentModal} />
      <Stack.Screen name={`index`} />
      <Stack.Screen
        name={`_sitemap`} /* Implicit: https://docs.expo.dev/router/reference/sitemap/ */
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <MinimalErrorBoundary>
      <IntlProvider locale={locale} defaultLocale="en-US">
        <SafeAreaProvider>
          <ThemeProvider>
            <Background>
              <ErrorBoundary>
                <Suspense fallback={<Splash />}>
                  <AuthGate>
                    <GqlProvider>
                      <ErrorBoundary>
                        <Layout />
                      </ErrorBoundary>
                      <MinimalErrorBoundary>
                        <Suspense fallback={null}>
                          <Analytics />
                          <WalletConnectListeners />
                          <NotificationsProvider />
                        </Suspense>
                      </MinimalErrorBoundary>
                    </GqlProvider>
                  </AuthGate>
                </Suspense>
              </ErrorBoundary>
            </Background>
            <SnackbarProvider />
            <UpdateProvider />
          </ThemeProvider>
        </SafeAreaProvider>
      </IntlProvider>
    </MinimalErrorBoundary>
  );
}
