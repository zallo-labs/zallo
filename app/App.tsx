import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import './src/features/ethers';
import { CONFIG } from './src/config';
import GqlTest from './src/components/Test';
import { WalletProvider } from './src/features/wallet/wallet.provider';
import { SafeProvider } from './src/features/safe/safe.provider';

export default () => (
  <WalletProvider>
    <SafeProvider>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app! :)</Text>
        <Text>Environment: {CONFIG.environment}</Text>
        <GqlTest />
      </View>
    </SafeProvider>
  </WalletProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
