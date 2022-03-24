import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { helloWorld } from 'lib';
import { CONFIG } from './config';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app! :)</Text>
      <Text>{helloWorld}</Text>
      <Text>{CONFIG.deployment}</Text>
      <StatusBar style="auto" />
    </View>
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
