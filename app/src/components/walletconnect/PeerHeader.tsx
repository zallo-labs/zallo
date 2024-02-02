import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { SignClientTypes } from '@walletconnect/types';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';

export interface PeerHeaderProps {
  peer: SignClientTypes.Metadata | undefined;
  action?: string;
}

export const PeerHeader = ({ peer, action }: PeerHeaderProps) => {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Image source={peer?.icons} style={styles.icon} />

      <Text variant="headlineMedium" style={styles.actionText}>
        <Text variant="headlineMedium">{peer?.name || 'Unknown DApp'} </Text>
        {action}
      </Text>

      {peer && (
        <Link href={peer.url as `${string}:${string}`} asChild>
          <Text variant="titleMedium" style={styles.url}>
            {new URL(peer.url).hostname}
          </Text>
        </Link>
      )}
    </View>
  );
};

const stylesheet = createStyles(({ colors, corner }) => ({
  container: {
    marginVertical: 8,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: corner.l,
  },
  actionText: {
    color: colors.secondary,
    textAlign: 'center',
  },
  url: {
    color: colors.tertiary,
  },
}));
