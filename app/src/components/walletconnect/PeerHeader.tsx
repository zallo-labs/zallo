import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { SignClientTypes } from '@walletconnect/types';
import { createStyles, useStyles } from '@theme/styles';

export interface PeerHeaderProps {
  peer: SignClientTypes.Metadata;
  children: ReactNode;
}

export const PeerHeader = ({ peer, children: action }: PeerHeaderProps) => {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Image source={peer.icons} style={styles.icon} />

      <Text variant="headlineMedium" style={styles.action}>
        <Text variant="headlineMedium">{peer.name || '?'} </Text>
        {action}
      </Text>

      {peer.description && <Text style={styles.description}>{peer.description}</Text>}
    </View>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  container: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 80,
    height: 80,
  },
  action: {
    color: colors.secondary,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
}));
