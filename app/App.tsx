import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ApolloProvider } from '@apollo/client';

import { helloWorld } from 'lib';
import { CONFIG } from './src/config';
import { APOLLO_CLIENT } from './src/gql';
import GqlTest from './src/components/Test';
import './src/features/ethers';
import { WalletProvider } from './src/features/wallet/wallet.provider';

export default function App() {
  return (
    <WalletProvider>
      <ApolloProvider client={APOLLO_CLIENT}>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <Text>Open up App.tsx to start working on your app! :)</Text>
          <Text>{helloWorld}</Text>
          <Text>Environment: {CONFIG.environment}</Text>
          <GqlTest />
        </View>
      </ApolloProvider>
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
