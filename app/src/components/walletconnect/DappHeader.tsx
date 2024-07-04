import { Image } from '#/Image';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { CoreTypes } from '@walletconnect/types';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { DappVerification } from './DappVerification';
import { graphql } from 'relay-runtime';
import { DappHeader_dappMetadata$key } from '~/api/__generated__/DappHeader_dappMetadata.graphql';
import { useFragment } from 'react-relay';

const DappMetadata = graphql`
  fragment DappHeader_dappMetadata on DappMetadata {
    __typename
    name
    url
    icons
  }
`;

export interface DappHeaderProps {
  dapp: CoreTypes.Metadata | DappHeader_dappMetadata$key | undefined;
  action?: string;
  request?: number;
}

export function DappHeader({ action, request, ...props }: DappHeaderProps) {
  const { styles } = useStyles(stylesheet);

  const dappFragment = useFragment(
    DappMetadata,
    props.dapp && isFragment(props.dapp) ? props.dapp : null,
  );

  const dapp = dappFragment || (props.dapp as CoreTypes.Metadata);

  return (
    <View style={styles.container}>
      {dapp && dapp.icons.length > 0 && <Image source={[...dapp.icons]} style={styles.icon} />}

      <Text variant="headlineMedium" style={styles.actionText}>
        <Text variant="headlineMedium">{dapp?.name || 'Unknown dapp'} </Text>
        {action}
      </Text>

      {dapp?.url && (
        <Link href={dapp.url as `${string}:${string}`} asChild target="_blank">
          <Text variant="titleMedium" style={styles.url}>
            {new URL(dapp.url).hostname}
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

function isFragment(
  d: CoreTypes.Metadata | DappHeader_dappMetadata$key,
): d is DappHeader_dappMetadata$key {
  // TODO: check
  return '__typename' in d;
}
