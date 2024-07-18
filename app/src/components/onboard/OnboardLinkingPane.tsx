import { useLinkingTokenUrl } from '#/link/useLinkingTokenUrl';
import { AppStoreBadge, GooglePlayBadge } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { mq } from 'react-native-unistyles';
import { useLazyQuery } from '~/api';
import { graphql } from 'relay-runtime';
import { OnboardLinkingPaneQuery } from '~/api/__generated__/OnboardLinkingPaneQuery.graphql';
import { CONFIG } from '~/util/config';

const Query = graphql`
  query OnboardLinkingPaneQuery {
    user {
      id
      ...useLinkingTokenUrl_user
    }
  }
`;

export function OnboardLinkingPane() {
  const { styles } = useStyles(stylesheet);

  const [qrSize, setQrSize] = useState(0);

  const { user } = useLazyQuery<OnboardLinkingPaneQuery>(Query, {});
  const link = useLinkingTokenUrl({ user });

  return (
    <View
      style={styles.pane}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setQrSize(Math.min(width * 0.6, height * 0.6));
      }}
    >
      <QRCode
        value={link}
        color={styles.onPane.color}
        size={qrSize}
        backgroundColor="transparent"
        ecl="L"
      />

      <Text variant="headlineMedium">Continue with Zallo</Text>

      <View style={styles.storesContainer}>
        <Link href={CONFIG.metadata.appStore} asChild>
          <AppStoreBadge alt="App Store" contentFit="contain" style={styles.store} />
        </Link>

        <Link href={CONFIG.metadata.playStore} asChild>
          <GooglePlayBadge alt="Google Play" contentFit="contain" style={styles.store} />
        </Link>
      </View>
    </View>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  pane: {
    maxWidth: 600,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.primaryContainer,
    borderTopLeftRadius: corner.l,
    borderBottomLeftRadius: corner.l,
    display: {
      [mq.only.width(0, 'large')]: 'none',
    },
  },
  onPane: {
    color: colors.onPrimaryContainer,
  },
  storesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginVertical: 16,
  },
  store: {
    minWidth: 180,
    minHeight: 60,
  },
}));
