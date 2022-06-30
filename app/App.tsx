import 'node-libs-react-native/globals';
import '~/provider';
import '@util/configImmer';

import { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RecoilRoot } from 'recoil';

import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigator } from '@features/navigation/RootNavigator';
import { Background } from '@components/Background';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';
import { GqlProvider } from '@gql/GqlProvider';
import { Toast } from '@components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { Splash } from '@components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '@features/AuthGate';
import { NAVIGATION_THEME } from '@util/theme/navigation';
import { ThemeProvider } from '@util/theme/ThemeProvider';
import { SentryUser } from '@components/SentryUser';

export default () => (
  <LocalizatonProvider>
    <ThemeProvider>
      <Background>
        <ErrorBoundary>
          <Suspense fallback={<Splash />}>
            <RecoilRoot>
              <SentryUser />
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthGate>
                  <GqlProvider>
                    <StatusBar style="inverted" />
                    <SafeProvider>
                      <NavigationContainer theme={NAVIGATION_THEME}>
                        <RootNavigator />
                      </NavigationContainer>
                    </SafeProvider>
                  </GqlProvider>
                </AuthGate>
                <Toast />
              </GestureHandlerRootView>
            </RecoilRoot>
          </Suspense>
        </ErrorBoundary>
      </Background>
    </ThemeProvider>
  </LocalizatonProvider>
);
