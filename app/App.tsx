import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import '~/provider';
import { WalletProvider } from '@features/wallet/WalletProvider';
import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigation } from '@features/navigation/RootNavigation';
import { SafeArea } from '@components/SafeArea';
import { NAV_THEME, PAPER_THEME } from '~/theme';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';
import { GqlProvider } from '@gql/GqlProvider';
import { Toast } from '@components/Toast';
import { ShowSplash } from '@components/splash/ShowSplash';
import { HideSplash } from '@components/splash/HideSplash';

const Status = () => {
  const { colors } = useTheme();
  return <StatusBar style="inverted" backgroundColor={colors.background} />;
};

export default () => (
  <LocalizatonProvider>
    <ShowSplash />
    <PaperProvider theme={PAPER_THEME}>
      <SafeArea>
        <WalletProvider>
          <GqlProvider>
            <Status />
            <SafeProvider>
              <HideSplash />
              <NavigationContainer theme={NAV_THEME}>
                <RootNavigation />
              </NavigationContainer>
            </SafeProvider>
          </GqlProvider>
        </WalletProvider>
        <Toast />
      </SafeArea>
    </PaperProvider>
  </LocalizatonProvider>
);
