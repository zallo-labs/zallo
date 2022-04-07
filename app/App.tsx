import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import '@ethers';
import { WalletProvider } from '@features/wallet/WalletProvider';
import { SafeProvider } from '@features/safe/SafeProvider';
import { RootNavigation } from '@features/navigation/RootNavigation';
import { SafeArea } from '@components/SafeArea';
import { NAV_THEME, PAPER_THEME } from '~/theme';

const Status = () => {
  const { colors } = useTheme();
  return <StatusBar style="inverted" backgroundColor={colors.background} />;
};

export default () => (
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
);
