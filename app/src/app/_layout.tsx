import '~/util/sentry/init';
import { locale } from 'expo-localization';
import { Slot, Stack } from 'expo-router';
import { Suspense } from 'react';
import { IntlProvider } from 'react-intl';
import { Analytics } from '~/components/Analytics';
import { ErrorBoundary } from '~/components/ErrorBoundary/ErrorBoundary';
import { MinimalErrorBoundary } from '~/components/ErrorBoundary/MinimalErrorBoundary';
import { Background } from '~/components/layout/Background';
import { Splash } from '~/components/Splash';
import { WalletConnectListeners } from '~/components/walletconnect/WalletConnectListeners';
import { GqlProvider } from '~/gql/GqlProvider';
import { AuthGate } from '~/provider/AuthGate';
import { NotificationsProvider } from '~/provider/NotificationsProvider';
import { SnackbarProvider } from '~/provider/SnackbarProvider';
import { UpdateProvider } from '~/provider/UpdateProvider';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { AppbarHeader } from '~/components/Appbar/AppbarHeader';

export const unstable_settings = {
  initialRouteName: 'index',
};

function Layout() {
  return (
    <Stack screenOptions={{ header: AppbarHeader }}>
      <Slot />
      <Stack.Screen name="/link/token" options={{ presentation: 'modal' }} />
      <Stack.Screen name="/link/[token]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <MinimalErrorBoundary>
      <IntlProvider locale={locale} defaultLocale="en-US">
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
      </IntlProvider>
    </MinimalErrorBoundary>
  );
}
