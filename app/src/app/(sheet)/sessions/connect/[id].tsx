import { Redirect, useRouter } from 'expo-router';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { Button } from '#/Button';
import { Actions } from '#/layout/Actions';
import { Sheet } from '#/sheet/Sheet';
import { AccountsList } from '#/walletconnect/AccountsList';
import { DappHeader } from '#/walletconnect/DappHeader';
import { hideSnackbar, showError, showSuccess } from '#/provider/SnackbarProvider';
import {
  sessionChains,
  supportedNamespaces,
  useUpdateWalletConnect,
  useWalletConnect,
} from '~/lib/wc';
import { createStyles, useStyles } from '@theme/styles';
import { z } from 'zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { Text } from 'react-native-paper';
import { SignClientTypes } from '@walletconnect/types';
import { useDappVerification, type VerificationStatus } from '#/walletconnect/DappVerification';
import { P, match } from 'ts-pattern';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { Id_ConnectSessionSheetQuery } from '~/api/__generated__/Id_ConnectSessionSheetQuery.graphql';

const Query = graphql`
  query Id_ConnectSessionSheetQuery {
    accounts {
      id
      chain
      ...AccountsList_account
    }
  }
`;

const ConnectSessionSheetParams = z.object({ id: z.coerce.number() });

export default function ConnectSessionSheet() {
  const { id } = useLocalParams(ConnectSessionSheetParams);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const client = useWalletConnect();
  const update = useUpdateWalletConnect();

  const proposal = useMemo(
    () => Object.values(client.getPendingSessionProposals()).find((p) => p.id === id),
    [client, id],
  );
  const dapp = proposal?.proposer.metadata.name;
  const chains = sessionChains(proposal);
  const verification = useDappVerification(id);

  const accounts = useLazyLoadQuery<Id_ConnectSessionSheetQuery>(Query, {}).accounts.filter((a) =>
    chains.includes(a.chain),
  );
  const [selected, updateSelected] = useImmer(new Set([useSelectedAccount()].filter(Boolean)));

  useEffect(() => {
    hideSnackbar(); // Hide 'Pairing with DApp' snackbar
  }, []);

  useEffect(() => {
    const handleExpiry = (args: SignClientTypes.EventArguments['proposal_expire']) => {
      if (args.id === id) {
        showError(`${dapp} session proposal expired, please try again`);
        router.back();
      }
    };
    client.engine.signClient.events.on('proposal_expire', handleExpiry);

    return () => {
      client.engine.signClient.events.off('proposal_expire', handleExpiry);
    };
  }, [client, dapp, id, router]);

  if (!proposal) {
    showError(`${dapp} session proposal wasn't found, please try again`);
    return <Redirect href=".." />;
  }

  const connect = async () => {
    try {
      await client.approveSession({
        id,
        namespaces: buildApprovedNamespaces({
          proposal,
          supportedNamespaces: supportedNamespaces([...selected]),
        }),
      });

      showSuccess(`Connected with ${dapp}`, { visibilityTime: 2000 });
    } catch (error) {
      showError(`Failed to connect to ${dapp}: ${(error as Error).message}`, { event: { error } });
    }
    update();
    router.back();
  };

  const reject = () => {
    client.rejectSession({ id, reason: getSdkError('USER_REJECTED') });
    update();
    router.back();
  };

  const firstConnection =
    !proposal.pairingTopic ||
    !client.core.pairing.getPairings().find((p) => p.topic === proposal.pairingTopic);

  return (
    <Sheet onClose={reject}>
      <DappHeader
        metadata={proposal.proposer.metadata}
        request={proposal.id}
        action="wants to connect"
      />

      {firstConnection && (
        <Text variant="bodyMedium" style={styles.pairWarning}>
          This is your first time connecting with this dapp
        </Text>
      )}

      <AccountsList accounts={accounts} selected={selected} updateSelected={updateSelected} />

      <Actions>
        <Button mode="text" onPress={reject}>
          Reject
        </Button>

        <Button
          mode="contained"
          onPress={connect}
          disabled={selected.size === 0}
          style={styles.connect(verification)}
          labelStyle={styles.connectLabel(verification)}
        >
          Connect
        </Button>
      </Actions>
    </Sheet>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  pairWarning: {
    marginHorizontal: 16,
    textAlign: 'center',
    color: colors.warning,
  },
  connect: (status: VerificationStatus) => ({
    backgroundColor: match(status)
      .with('safe', () => colors.primary)
      .with('unverified', () => colors.warning)
      .with(P.union('domain-mismatch', 'malicious'), () => colors.error)
      .exhaustive(),
  }),
  connectLabel: (status: VerificationStatus) => ({
    color: match(status)
      .with('safe', () => colors.onPrimary)
      .with('unverified', () => colors.onWarning)
      .with(P.union('domain-mismatch', 'malicious'), () => colors.onError)
      .exhaustive(),
  }),
}));

export { ErrorBoundary } from '#/ErrorBoundary';
