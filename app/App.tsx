import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ApolloProvider } from '@apollo/client';

import { helloWorld } from 'lib';
import { CONFIG } from './src/config';
import { APOLLO_CLIENT } from './src/gql';
import GqlTest from './src/components/GqlTest';
import './src/ethers';

export default function App() {
  return (
    <ApolloProvider client={APOLLO_CLIENT}>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app! :)</Text>
        <Text>{helloWorld}</Text>
        <Text>Deployment: {CONFIG.deployment}</Text>
        <GqlTest />
        <StatusBar style="auto" />
      </View>
    </ApolloProvider>
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
