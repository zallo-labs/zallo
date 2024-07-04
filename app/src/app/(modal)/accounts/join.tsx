import { Blur } from '#/Blur';
import { Button } from '#/Button';
import { IconButton } from '#/IconButton';
import { Actions } from '#/layout/Actions';
import { Surface } from '#/layout/Surface';
import { useLinkingTokenUrl } from '#/link/useLinkingTokenUrl';
import { withSuspense } from '#/skeleton/withSuspense';
import { useApproverAddress } from '@network/useApprover';
import { CloseIcon, ScanIcon, ShareIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link, useRouter } from 'expo-router';
import { Address } from 'lib';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useLazyLoadQuery, useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { Subject } from 'rxjs';
import { z } from 'zod';
import { join_JoinAccountModalQuery } from '~/api/__generated__/join_JoinAccountModalQuery.graphql';
import { join_JoinAccountModalSubscription } from '~/api/__generated__/join_JoinAccountModalSubscription.graphql';
import { useScanAddress } from '~/app/scan';
import { useGetEvent } from '~/hooks/useGetEvent';
import { useLocalParams } from '~/hooks/useLocalParams';
import { share } from '~/lib/share';
import { zBool } from '~/lib/zod';

const Query = graphql`
  query join_JoinAccountModalQuery {
    user {
      id
      ...useLinkingTokenUrl_user
    }
  }
`;

const Subscription = graphql`
  subscription join_JoinAccountModalSubscription {
    userLinked {
      id
      user {
        id
      }
      issuer
      linker
    }
  }
`;

const APPROVER_LINKED = new Subject<Address>();
export function useLinkZallo() {
  const getEvent = useGetEvent();
  return () => getEvent({ pathname: `/(modal)/accounts/join` }, APPROVER_LINKED);
}

const JoinAccountParams = z.object({ personal: zBool().default('true') });

function JoinAccountModal() {
  const { styles } = useStyles(stylesheet);
  const approver = useApproverAddress();
  const { personal } = useLocalParams(JoinAccountParams);
  const router = useRouter();
  const scan = useScanAddress();

  const setPersonal = (v: boolean) => router.setParams({ personal: v ? 'true' : 'false' });

  const { user } = useLazyLoadQuery<join_JoinAccountModalQuery>(Query, {});
  const linkingToken = useLinkingTokenUrl({ user });
  const value = personal ? linkingToken : approver;

  useSubscription<join_JoinAccountModalSubscription>(
    useMemo(
      () => ({
        subscription: Subscription,
        variables: {},
        onNext: (data) => {
          if (data?.userLinked) {
            const { issuer, linker } = data.userLinked;
            router.back();
            APPROVER_LINKED.next(issuer === approver ? linker : issuer);
          }
        },
      }),
      [approver, router],
    ),
  );

  return (
    <Blur>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Link href=".." asChild>
            <IconButton mode="contained-tonal" icon={CloseIcon} size={styles.iconButton.width} />
          </Link>

          <Text variant="displaySmall" style={styles.name}>
            Join account
          </Text>

          <View style={styles.iconButton} />
        </View>

        <View style={styles.content}>
          <Surface style={styles.qrSurface}>
            <QRCode
              value={value}
              color={styles.qr.color}
              size={styles.qr.fontSize}
              backgroundColor="transparent"
              ecl="L"
            />
          </Surface>

          <Surface style={styles.personalSurface}>
            <Text variant="labelLarge">This is my personal account</Text>
            <Switch value={personal} onValueChange={setPersonal} />
          </Surface>
        </View>

        <Actions flex={false} style={styles.actions}>
          <Button mode="contained-tonal" icon={ShareIcon} onPress={() => share({ url: value })}>
            Share token
          </Button>

          <Button
            mode="contained"
            icon={ScanIcon}
            onPress={async () => {
              const address = await scan();
              if (address) {
                router.back();
                APPROVER_LINKED.next(address);
              }
            }}
          >
            Scan instead
          </Button>
        </Actions>
      </View>
    </Blur>
  );
}

const stylesheet = createStyles(({ colors, iconSize, corner }, { insets, screen }) => ({
  container: {
    flex: 1,
    marginTop: insets.top,
  },
  iconButton: {
    width: iconSize.small,
  },
  name: {
    flex: 1,
    textAlign: 'center',
    color: colors.onScrim,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 8,
  },
  modeContainer: {
    gap: 16,
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  address: {
    color: colors.inverseOnSurface,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  qrSurface: {
    padding: 32,
    borderRadius: corner.m,
    backgroundColor: colors.primaryContainer,
  },
  qr: {
    fontSize: Math.min(screen.width * 0.8, screen.height * 0.6, 1024 - 96),
    color: colors.onPrimaryContainer,
  },
  personalSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  actions: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
  },
}));

export default withSuspense(JoinAccountModal, null);

export { ErrorBoundary } from '#/ErrorBoundary';
