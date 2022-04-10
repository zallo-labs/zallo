import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import '@features/provider';
import { WalletProvider } from '@features/wallet/WalletProvider';
import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigation } from '@features/navigation/RootNavigation';
import { SafeArea } from '@components/SafeArea';
import { NAV_THEME, PAPER_THEME } from '~/theme';
import { LocalizatonProvider } from '@features/localization/LocalizationProvider';

const Status = () => {
  const { colors } = useTheme();
  return <StatusBar style="inverted" backgroundColor={colors.background} />;
};

export default () => (
  <LocalizatonProvider>
    <PaperProvider theme={PAPER_THEME}>
      <SafeArea>
        <Status />
        <WalletProvider>
          <SafeProvider>
            <NavigationContainer theme={NAV_THEME}>
              <RootNavigation />
            </NavigationContainer>
          </SafeProvider>
        </WalletProvider>
      </SafeArea>
    </PaperProvider>
  </LocalizatonProvider>
);
