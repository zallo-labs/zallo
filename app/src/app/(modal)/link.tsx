import QRCode from 'react-native-qrcode-svg';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, PasteIcon, ScanIcon, ShareIcon } from '@theme/icons';
import { Actions } from '#/layout/Actions';
import { ScaledSize, View, useWindowDimensions } from 'react-native';
import { Blur } from '#/Blur';
import { Button } from '#/Button';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { LinkingTokenModal_SubscriptionSubscription } from '@api/generated/graphql';
import { Link } from 'expo-router';
import { appLink } from '~/lib/appLink';
import { share } from '~/lib/share';
import { createStyles, useStyles } from '@theme/styles';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export const LINKINGS_FROM_TOKEN = new Subject<LinkingTokenModal_SubscriptionSubscription>();

const Query = gql(/* GraphQL */ `
  query LinkingTokenModal {
    user {
      id
      linkingToken
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription LinkingTokenModal_Subscription {
    user {
      id
    }
  }
`);

export default function LinkingModal() {
  const { styles } = useStyles(stylesheet);

  const { user } = useQuery(Query).data;
  const link = appLink({ pathname: `/link/token`, params: { token: user.linkingToken } });

  const [subscription] = useSubscription({ query: Subscription });
  useEffect(() => {
    if (!subscription.stale && subscription.data) LINKINGS_FROM_TOKEN.next(subscription.data);
  }, [subscription.data, subscription.stale]);

  return (
    <Blur>
      <View style={styles.container(useSafeAreaInsets())}>
        <Link href=".." asChild>
          <IconButton mode="contained-tonal" icon={CloseIcon} style={styles.close} />
        </Link>

        <View style={styles.qrContainer}>
          <Surface style={styles.qrSurface}>
            <QRCode
              value={link}
              color={styles.qr.color}
              size={styles.qrSize(useWindowDimensions()).fontSize}
              backgroundColor="transparent"
              ecl="M"
              enableLinearGradient
              linearGradient={[styles.primary.color, styles.tertiary.color]}
            />
          </Surface>

          <View style={styles.textContainer}>
            <Text variant="headlineMedium" style={styles.text}>
              Linking a device
            </Text>

            <Text variant="bodyLarge" style={styles.text}>
              1. Open Zallo on your existing device{'\n'}
              2. Tap scan <ScanIcon size={styles.textIcon.fontSize} style={styles.text} />
              {'\n'}
              3. Scan the token on this screen, or share & paste{' '}
              <PasteIcon size={styles.textIcon.fontSize} style={styles.text} /> the linking token
            </Text>
          </View>
        </View>

        <Actions flex={false}>
          <Button mode="contained-tonal" icon={ShareIcon} onPress={() => share({ url: link })}>
            Share token
          </Button>

          <Link href="/scan" asChild>
            <Button mode="contained" icon={ScanIcon}>
              Scan instead
            </Button>
          </Link>
        </Actions>
      </View>
    </Blur>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: (insets: EdgeInsets) => ({
    flex: 1,
    marginTop: insets.top,
  }),
  close: {
    marginHorizontal: 16,
  },
  textContainer: {
    marginTop: 16,
  },
  text: {
    color: colors.onScrim,
    marginHorizontal: 16,
  },
  textIcon: {
    fontSize: 14,
  },
  qrContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  qrSurface: {
    padding: 16,
    borderRadius: 16,
  },
  qrSize: (window: ScaledSize) => ({
    fontSize: {
      compact: Math.min(window.width * 0.8, window.height * 0.8),
      medium: Math.min(window.width * 0.7, window.height * 0.7),
      expanded: Math.min(window.width * 0.5, window.height * 0.5),
    },
  }),
  qr: {
    color: colors.onSurface,
  },
  primary: {
    color: colors.primary,
  },
  tertiary: {
    color: colors.tertiary,
  },
  requestButton: {
    color: colors.inverseOnSurface,
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';