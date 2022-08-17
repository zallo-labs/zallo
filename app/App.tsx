import 'node-libs-react-native/globals';
import '~/provider';
import '@util/configImmer';

import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { Background } from '@components/Background';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';
import { GqlProvider } from '@gql/GqlProvider';
import { ToastProvider } from '@components/ToastProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@util/sentry/ErrorBoundary';
import { Splash } from '@components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '@features/AuthGate';
import { ThemeProvider } from '@util/theme/ThemeProvider';
import { SentryUser } from '@util/sentry/SentryUser';
import { NavigationProvider } from '@features/navigation/NavigationProvider';
import { withSentry } from '@util/sentry/sentry';
import { RootNavigator } from '~/navigation/RootNavigator';
import { AutoFaucet } from '~/components2/AutoFaucet';

export default withSentry(() => (
  <LocalizatonProvider>
    <ThemeProvider>
      <Background>
        <StatusBar style="light" backgroundColor="transparent" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={<Splash />}>
              <RecoilRoot>
                <AuthGate>
                  <SentryUser />
                  <GqlProvider>
                    <NavigationProvider>
                      <RootNavigator />
                    </NavigationProvider>
                    <AutoFaucet />
                  </GqlProvider>
                </AuthGate>
                <ToastProvider />
              </RecoilRoot>
            </Suspense>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </Background>
    </ThemeProvider>
  </LocalizatonProvider>
));
