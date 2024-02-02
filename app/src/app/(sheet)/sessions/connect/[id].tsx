import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { Sheet } from '~/components/sheet/Sheet';
import { AccountsList } from '~/components/walletconnect/AccountsList';
import { PeerHeader } from '~/components/walletconnect/PeerHeader';
import { useQuery } from '~/gql';
import { hideSnackbar, showError, showSuccess } from '~/components/provider/SnackbarProvider';
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

const Query = gql(/* GraphQL */ `
  query ConnectSessionSheet {
    accounts {
      id
      chain
      ...AccountsList_Account
    }
  }
`);

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

  const accounts = useQuery(Query).data.accounts.filter((a) => chains.includes(a.chain));
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
    showError("DApp session proposal wasn't found, please try again");
    router.back();
    return null;
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
      <PeerHeader peer={proposal.proposer.metadata} action="wants to connect" />

      {firstConnection && (
        <Text variant="bodyMedium" style={styles.pairWarning}>
          This is your first time connecting with this dapp
        </Text>
      )}

      <AccountsList accounts={accounts} selected={selected} updateSelected={updateSelected} />

      <Actions>
        <Button mode="contained" onPress={connect} disabled={selected.size === 0}>
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
}));
