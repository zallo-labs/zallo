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
import { AuthGate } from '~/provider/AuthGate';
import { NotificationsProvider } from '~/provider/NotificationsProvider';
import { SnackbarProvider } from '~/provider/SnackbarProvider';
import { UpdateProvider } from '~/provider/UpdateProvider';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { AppbarHeader } from '~/components/Appbar/AppbarHeader';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

const transparentModal: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  headerShown: false,
};

export const unstable_settings = {
  initialRouteName: 'index',
};

function Layout() {
  return (
    <Stack screenOptions={{ header: AppbarHeader }}>
      <Stack.Screen name={`[account]/(home)`} />
      <Stack.Screen name={`[account]/settings`} />
      <Stack.Screen name={`[account]/tokens`} options={{ headerShown: false }} />
      <Stack.Screen name={`[account]/transfer`} />
      <Stack.Screen name={`accounts/create`} />
      <Stack.Screen name={`contacts/[address]`} />
      <Stack.Screen name={`contacts/add`} />
      <Stack.Screen name={`contacts/index`} />
      <Stack.Screen name={`link/index`} options={transparentModal} />
      <Stack.Screen name={`link/[token]`} options={transparentModal} />
      <Stack.Screen name={`link/ledger`} />
      <Stack.Screen name={`onboard/index`} />
      <Stack.Screen name={`onboard/user`} />
      <Stack.Screen name={`scan/index`} options={{ headerShown: false }} />
      <Stack.Screen name={`scan/[address]`} options={transparentModal} />
      <Stack.Screen name={`settings/auth`} />
      <Stack.Screen name={`settings/notifications`} />
      <Stack.Screen name={`token/[token]`} />
      <Stack.Screen name={`token/add`} />
      <Stack.Screen name={`[...unmatched]`} />
      <Stack.Screen name={`confirm`} />
      <Stack.Screen name={`index`} />
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
