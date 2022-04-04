import React from 'react';
import { Text, View } from 'react-native';

import { useSafes } from '@gql';
import { useSafe } from '@features/safe/safe.provider';
import { useWallet } from '@features/wallet/wallet.provider';

export default () => {
  const wallet = useWallet();
  const safe = useSafe();
  const { safes } = useSafes();

  console.log({ safes: safes?.map((s) => s.id) });

  return (
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <Text>Safe address: {safe.contract.address}</Text>
      <Text>Wallet address: {wallet.address}</Text>
    </View>
  );
};
