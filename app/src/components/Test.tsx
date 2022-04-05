import React from 'react';
import { View } from 'react-native';

import { useSafes } from '@queries';
import { useSafe } from '@features/safe/safe.provider';
import { useWallet } from '@features/wallet/wallet.provider';
import { Paragraph } from 'react-native-paper';

export default () => {
  const wallet = useWallet();
  const safe = useSafe();
  const { safes } = useSafes();

  console.log({ safes: safes?.map((s) => s.id) });

  return (
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <Paragraph>Safe address: {safe.contract.address}</Paragraph>
      <Paragraph>Wallet address: {wallet.address}</Paragraph>
    </View>
  );
};
