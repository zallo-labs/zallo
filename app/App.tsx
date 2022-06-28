import 'node-libs-react-native/globals';
import '~/provider';
import '@util/configImmer';

import { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { RecoilRoot } from 'recoil';

import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigator } from '@features/navigation/RootNavigator';
import { Background } from '@components/Background';
import { NAV_THEME, PAPER_THEME } from '~/theme';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';
import { GqlProvider } from '@gql/GqlProvider';
import { Toast } from '@components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { Splash } from '@components/Splash';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '@features/AuthGate';

export default () => (
  <LocalizatonProvider>
    <PaperProvider theme={PAPER_THEME}>
      <Background>
        <ErrorBoundary>
          <Suspense fallback={<Splash />}>
            <RecoilRoot>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthGate>
                  <GqlProvider>
                    <StatusBar style="inverted" />
                    <SafeProvider>
                      <NavigationContainer theme={NAV_THEME}>
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
    </PaperProvider>
  </LocalizatonProvider>
);
