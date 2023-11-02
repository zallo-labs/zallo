import QRCode from 'react-native-qrcode-svg';
import { makeStyles } from '@theme/makeStyles';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, PasteIcon, ScanIcon, ShareIcon } from '@theme/icons';
import { Actions } from '~/components/layout/Actions';
import { View } from 'react-native';
import { Blur } from '~/components/Blur';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { LinkingTokenModal_SubscriptionSubscription } from '@api/generated/graphql';
import { useRouter } from 'expo-router';
import { getDeepLink } from '~/util/config';
import { share } from '~/lib/share';

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
  const styles = uesStyles();
  const router = useRouter();

  const { user } = useQuery(Query).data;
  const link = getDeepLink({ pathname: `/link/token`, params: { token: user.linkingToken } });

  const [subscription] = useSubscription({ query: Subscription });
  useEffect(() => {
    if (!subscription.stale && subscription.data) LINKINGS_FROM_TOKEN.next(subscription.data);
  }, [subscription.data, subscription.stale]);

  return (
    <Blur>
      <View style={styles.container}>
        <IconButton
          mode="contained-tonal"
          icon={CloseIcon}
          style={styles.close}
          onPress={router.back}
        />

        <View style={styles.qrContainer}>
          <Surface style={styles.qrSurface}>
            <QRCode
              value={link}
              color={styles.qr.color}
              size={styles.qr.fontSize}
              backgroundColor="transparent"
              ecl="M"
              enableLinearGradient
              linearGradient={[styles.primary.color, styles.tertiary.color]}
            />
          </Surface>

          <View style={{ marginTop: 16 }}>
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
          <Button mode="contained" icon={ShareIcon} onPress={() => share({ url: link })}>
            Linking token
          </Button>
        </Actions>
      </View>
    </Blur>
  );
}

const uesStyles = makeStyles(({ colors, window, insets }) => ({
  container: {
    flex: 1,
    marginTop: insets.top,
  },
  close: {
    marginHorizontal: 16,
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
  qr: {
    fontSize: Math.min(512, window.width - 64, window.height - 128),
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
