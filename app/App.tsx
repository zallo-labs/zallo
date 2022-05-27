import { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { RecoilRoot } from 'recoil';

import '~/provider';
import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigation } from '@features/navigation/RootNavigation';
import { SafeArea } from '@components/SafeArea';
import { NAV_THEME, PAPER_THEME } from '~/theme';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';
import { GqlProvider } from '@gql/GqlProvider';
import { Toast } from '@components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { Splash } from '@components/Splash';
import { StatusBar } from '@components/StatusBar';
import { AuthGate } from '@features/AuthGate';

export default () => (
  <LocalizatonProvider>
    <PaperProvider theme={PAPER_THEME}>
      <ErrorBoundary>
        <Suspense fallback={<Splash />}>
          <RecoilRoot>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeArea>
                <AuthGate>
                  <GqlProvider>
                    <StatusBar />
                    <SafeProvider>
                      <NavigationContainer theme={NAV_THEME}>
                        <RootNavigation />
                      </NavigationContainer>
                    </SafeProvider>
                  </GqlProvider>
                </AuthGate>
                <Toast />
              </SafeArea>
            </GestureHandlerRootView>
          </RecoilRoot>
        </Suspense>
      </ErrorBoundary>
    </PaperProvider>
  </LocalizatonProvider>
);
