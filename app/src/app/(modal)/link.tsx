import QRCode from 'react-native-qrcode-svg';
import { IconButton, Surface } from 'react-native-paper';
import { CloseIcon, ScanIcon, ShareIcon } from '@theme/icons';
import { Actions } from '#/layout/Actions';
import { View } from 'react-native';
import { Blur } from '#/Blur';
import { Button } from '#/Button';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { share } from '~/lib/share';
import { createStyles, useStyles } from '@theme/styles';
import { useLinkingTokenUrl } from '#/link/useLinkingTokenUrl';
import { Subject } from 'rxjs';
import { Address } from 'lib';
import { useGetEvent } from '~/hooks/useGetEvent';
import { useApproverAddress } from '@network/useApprover';

const Query = gql(/* GraphQL */ `
  query LinkingTokenModal {
    user {
      id
      ...useLinkingTokenUrl_User
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription LinkingModal_Subscription {
    userLinked {
      id
      user {
        id
      }
      issuer
      linker
    }
  }
`);

const APPROVER_LINKED = new Subject<Address>();
export function useLinkZallo() {
  const getEvent = useGetEvent();
  return () => getEvent({ pathname: `/(modal)/link` }, APPROVER_LINKED);
}

export default function LinkingModal() {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const approver = useApproverAddress();

  const { user } = useQuery(Query).data;
  const link = useLinkingTokenUrl({ user });

  const userLinked = useSubscription({ query: Subscription })[0];
  useEffect(() => {
    if (!userLinked.stale && userLinked.data) {
      const { issuer, linker } = userLinked.data.userLinked;
      APPROVER_LINKED.next(issuer === approver ? linker : issuer);
    }
  }, [approver, router, userLinked.data, userLinked.stale]);

  return (
    <Blur>
      <View style={styles.container}>
        <Link href=".." asChild>
          <IconButton mode="contained-tonal" icon={CloseIcon} style={styles.close} />
        </Link>

        <View style={styles.qrContainer}>
          <Surface style={styles.qrSurface}>
            <QRCode
              value={link}
              color={styles.qr.color}
              size={styles.qr.fontSize}
              backgroundColor="transparent"
              ecl="L"
            />
          </Surface>
        </View>

        <Actions flex={false} style={styles.actions}>
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

const stylesheet = createStyles(({ colors, corner }, { insets, screen }) => ({
  container: {
    flex: 1,
    marginTop: insets.top,
  },
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrSurface: {
    padding: 32,
    borderRadius: corner.m,
    backgroundColor: colors.primaryContainer,
  },
  qr: {
    fontSize: Math.min(screen.width * 0.8, screen.height * 0.7, 1024 - 96),
    color: colors.onPrimaryContainer,
  },
  primary: {
    color: colors.primary,
  },
  tertiary: {
    color: colors.tertiary,
  },
  actions: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';
