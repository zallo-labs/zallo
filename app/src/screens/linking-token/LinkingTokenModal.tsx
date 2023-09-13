import QRCode from 'react-native-qrcode-svg';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Screen } from '~/components/layout/Screen';
import { makeStyles } from '@theme/makeStyles';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, PasteIcon, ScanIcon, ShareIcon } from '@theme/icons';
import { Actions } from '~/components/layout/Actions';
import { Share, View } from 'react-native';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Blur } from '~/components/Blur';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { getLinkingUri } from './util';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { LinkingTokenModal_SubscriptionSubscription } from '@api/generated/graphql';

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
      name
    }
  }
`);

export interface LinkingTokenModalParams {}

export type LinkingTokenModalProps = StackNavigatorScreenProps<'LinkingTokenModal'>;

export const LinkingTokenModal = withSuspense(
  ({ navigation: { navigate, goBack } }: LinkingTokenModalProps) => {
    const styles = uesStyles();

    const { user } = useQuery(Query).data;
    const link = getLinkingUri(user.linkingToken);

    const [subscription] = useSubscription({ query: Subscription });
    useEffect(() => {
      if (!subscription.stale && subscription.data) LINKINGS_FROM_TOKEN.next(subscription.data);
    }, [navigate, subscription.data, subscription.stale]);

    return (
      <Blur>
        <Screen topInset>
          <IconButton
            mode="contained-tonal"
            icon={CloseIcon}
            style={styles.close}
            onPress={goBack}
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
                3. Scan the code on this screen, or share & paste{' '}
                <PasteIcon size={styles.textIcon.fontSize} style={styles.text} /> the linking code
              </Text>
            </View>
          </View>

          <Actions style={{ flexGrow: 0 }}>
            <Button
              mode="contained"
              icon={ShareIcon}
              onPress={() => Share.share({ url: link, message: link })}
            >
              Linking code
            </Button>
          </Actions>
        </Screen>
      </Blur>
    );
  },
  Blur,
);

const uesStyles = makeStyles(({ colors, window }) => ({
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
    fontSize: window.width - 64,
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
