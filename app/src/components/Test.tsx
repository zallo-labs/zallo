import React from 'react';
import { Text, View } from 'react-native';
import { useWallet } from '../features/wallet/provider';
import { useGetUserTestQuery } from '../gql';

export default () => {
  const { user } = useGetUserTestQuery();
  const wallet = useWallet();

  return (
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <Text>User email: {user?.email}</Text>
      <Text>Wallet address: {wallet.publicKey}</Text>
    </View>
  );
};
