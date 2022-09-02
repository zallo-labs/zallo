import { Call, getWalletId, tryDecodeUpsertWalletData } from 'lib';
import { memo, useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Accordion, AccordionProps } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { Suspend } from '~/components/Suspender';
import { CombinedWallet, WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import { ModifiedSpending } from './ModifiedSpending';
import { ModifiedQuorums } from './ModifiedQuorums';

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

export interface UpsertWalletMethodProps extends Partial<AccordionProps> {
  call: Call;
}

export const UpsertWalletMethod = memo(
  ({ call, ...accordionProps }: UpsertWalletMethodProps) => {
    const wallet = useDecodedUpsertWallet(call);

    if (!wallet) return <Suspend />;

    return (
      <Accordion
        title={
          <Text variant="titleMedium">{getUpsertWalletMethodName(wallet)}</Text>
        }
        {...accordionProps}
      >
        <Box mx={3}>
          <ModifiedQuorums quorums={wallet.quorums} />
          <ModifiedSpending limits={wallet.limits} />
        </Box>
      </Accordion>
    );
  },
);
