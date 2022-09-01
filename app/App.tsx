import 'node-libs-react-native/globals';
import '~/util/network/provider';
import '~/util/immer';

import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { Background } from '~/components/layout/Background';
import { LocalizatonProvider } from '~/provider/LocalizationProvider';
import { GqlProvider } from '~/gql/GqlProvider';
import { ToastProvider } from '~/provider/ToastProvider';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '~/util/sentry/ErrorBoundary';
import { Splash } from '~/components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '~/provider/AuthGate';
import { ThemeProvider } from '~/util/theme/ThemeProvider';
import { SentryUser } from '~/util/sentry/SentryUser';
import { withSentry } from '~/util/sentry/sentry';
import { RootNavigator } from '~/navigation/RootNavigator';
import { NavigationProvider } from '~/navigation/NavigationProvider';

export default withSentry(() => (
  <LocalizatonProvider>
    <ThemeProvider>
      <Background>
        <StatusBar style="light" backgroundColor="transparent" />
        {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
        <ErrorBoundary>
          <Suspense fallback={<Splash />}>
            <RecoilRoot>
              <AuthGate>
                <SentryUser />
                <GqlProvider>
                  <NavigationProvider>
                    <Suspense fallback={<Splash />}>
                      <RootNavigator />
                    </Suspense>
                  </NavigationProvider>
                </GqlProvider>
              </AuthGate>
              <ToastProvider />
            </RecoilRoot>
          </Suspense>
        </ErrorBoundary>
        {/* </GestureHandlerRootView> */}
      </Background>
    </ThemeProvider>
  </LocalizatonProvider>
));
