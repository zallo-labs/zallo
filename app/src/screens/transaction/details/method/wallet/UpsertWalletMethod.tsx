import { Call, getWalletId, hashQuorum, tryDecodeUpsertWalletData } from 'lib';
import { memo, useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { Suspend } from '~/components/Suspender';
import { CombinedWallet, WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import { AddedOrRemovedQuorumRow } from './AddedQuorumRow';

export const useDecodedUpsertWallet = (call?: Call) =>
  useWallet(
    useMemo((): WalletId | undefined => {
      const ref = tryDecodeUpsertWalletData(call?.data)?.ref;

      return ref && call
        ? {
            ref,
            accountAddr: call.to,
            id: getWalletId(call.to, ref),
          }
        : undefined;
    }, [call]),
  );

export const getUpsertWalletMethodName = (wallet: CombinedWallet) => {
  const prefix = wallet.state.status === 'add' ? 'Create' : 'Modify';
  return `${prefix} wallet: ${wallet.name}`;
};

export interface UpsertWalletMethodProps {
  call: Call;
}

export const UpsertWalletMethod = memo(({ call }: UpsertWalletMethodProps) => {
  const wallet = useDecodedUpsertWallet(call);

  if (!wallet) return <Suspend />;

  const modifiedQuorums = wallet.quorums.filter(
    (q) => q.state.status !== 'active',
  );

  return (
    <Accordion
      title={
        <Text variant="titleMedium">{getUpsertWalletMethodName(wallet)}</Text>
      }
    >
      <Container mx={3} separator={<Box mb={1} />}>
        <Text variant="titleSmall">Quorums</Text>

        {modifiedQuorums.map((q) => (
          <AddedOrRemovedQuorumRow key={hashQuorum(q.approvers)} quorum={q} />
        ))}
      </Container>
    </Accordion>
  );
});
