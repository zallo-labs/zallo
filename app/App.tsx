import 'node-libs-react-native/globals';
import '~/provider';
import '@util/configImmer';

import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';

import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigator } from '@features/navigation/RootNavigator';
import { Background } from '@components/Background';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';
import { GqlProvider } from '@gql/GqlProvider';
import { Toast } from '@components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@util/sentry/ErrorBoundary';
import { Splash } from '@components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '@features/AuthGate';
import { ThemeProvider } from '@util/theme/ThemeProvider';
import { SentryUser } from '@util/sentry/SentryUser';
import { NavigationProvider } from '@features/navigation/NavigationProvider';
import { withSentry } from '@util/sentry/sentry';

export default withSentry(() => (
  <LocalizatonProvider>
    <ThemeProvider>
      <Background>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={<Splash />}>
              <RecoilRoot>
                <AuthGate>
                  <SentryUser />
                  <GqlProvider>
                    <StatusBar style="inverted" />
                    <SafeProvider>
                      <NavigationProvider>
                        <RootNavigator />
                      </NavigationProvider>
                    </SafeProvider>
                  </GqlProvider>
                </AuthGate>
                <Toast />
              </RecoilRoot>
            </Suspense>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </Background>
    </ThemeProvider>
  </LocalizatonProvider>
));
