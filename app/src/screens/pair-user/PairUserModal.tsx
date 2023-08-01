import QRCode from 'react-native-qrcode-svg';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Screen } from '~/components/layout/Screen';
import { makeStyles } from '@theme/makeStyles';
import { IconButton, Surface, Text } from 'react-native-paper';
import { CloseIcon, ShareIcon } from '@theme/icons';
import { Actions } from '~/components/layout/Actions';
import { Share, View } from 'react-native';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Blur } from '~/components/Blur';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { getPairingLink } from './pairing';
import { showSuccess } from '~/provider/SnackbarProvider';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { useEffect } from 'react';

const Query = gql(/* GraphQL */ `
  query PairUserModal {
    user {
      id
      pairingToken
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription PairUserModal_Subscription {
    user {
      id
      name
    }
  }
`);

export interface PairUserModalParams {
  isOnboarding?: boolean;
}

export type PairUserModalProps = StackNavigatorScreenProps<'PairUserModal'>;

export const PairUserModal = withSuspense(
  ({ route, navigation: { navigate, goBack } }: PairUserModalProps) => {
    const { isOnboarding } = route.params;
    const styles = uesStyles();

    const { user } = useQuery(Query).data;
    const link = getPairingLink(user.pairingToken);

    const [subscription] = useSubscription({ query: Subscription });
    useEffect(() => {
      if (!subscription.stale && subscription.data) {
        const { user } = subscription.data;
        showSuccess(`Paired with user${user.name ? `: ${user.name}` : ''}`);
        navigate('Approver', { isOnboarding });
      }
    }, [isOnboarding, navigate, subscription.data, subscription.stale]);

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
            <Text variant="headlineLarge" style={styles.name}>
              Scan to pair
            </Text>

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
          </View>

          <Actions>
            <Button
              mode="contained"
              icon={ShareIcon}
              onPress={() => Share.share({ url: link, message: link })}
            >
              Share
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
  name: {
    textAlign: 'center',
    color: colors.onScrim,
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
