import '~/util/sentry/init';
import { Suspense } from 'react';
import { Slot } from 'expo-router';
import { MinimalErrorBoundary } from '~/components/ErrorBoundary/MinimalErrorBoundary';
import { IntlProvider } from 'react-intl';
import { locale } from 'expo-localization';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { Background } from '~/components/layout/Background';
import { ErrorBoundary } from '~/components/ErrorBoundary/ErrorBoundary';
import { Splash } from '~/components/Splash';
import { AuthGate } from '~/provider/AuthGate';
import { GqlProvider } from '~/gql/GqlProvider';
import { SnackbarProvider } from '~/provider/SnackbarProvider';
import { Analytics } from '~/components/Analytics';
import { WalletConnectListeners } from '~/components/walletconnect/WalletConnectListeners';
import { UpdateProvider } from '~/provider/UpdateProvider';
import { NotificationsProvider } from '~/provider/NotificationsProvider';

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
                      <Slot />
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
