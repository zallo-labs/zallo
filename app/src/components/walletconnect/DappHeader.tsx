import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { SignClientTypes } from '@walletconnect/types';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { DappVerification } from './DappVerification';

export interface DappHeaderProps {
  dapp: SignClientTypes.Metadata | undefined;
  action?: string;
  request?: number;
}

export function DappHeader({ dapp, action, request }: DappHeaderProps) {
  const { styles } = useStyles(stylesheet);

  const url = asUrl(dapp?.url);

  return (
    <View style={styles.container}>
      {dapp && dapp.icons.length > 0 && <Image source={dapp.icons} style={styles.icon} />}

      <Text variant="headlineMedium" style={styles.actionText}>
        <Text variant="headlineMedium">{dapp?.name || 'Unknown dapp'} </Text>
        {action}
      </Text>

      {url && (
        <Link href={url.href as `${string}:${string}`} asChild>
          <Text variant="titleMedium" style={styles.url}>
            {url.hostname}
          </Text>
        </Link>
      )}

      {request && <DappVerification request={request} style={styles.verification} />}
    </View>
  );
}

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
  verification: {
    marginTop: 16,
  },
}));

function asUrl(url?: string) {
  if (!url) return undefined;

  return new URL(url.startsWith('http') ? url : `https://${url}`);
}
