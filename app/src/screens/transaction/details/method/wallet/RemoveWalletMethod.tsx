import { Call, getWalletId, tryDecodeRemoveWalletData } from 'lib';
import { memo, useMemo } from 'react';
import { Text } from 'react-native-paper';
import { Suspend } from '~/components/Suspender';
import { CombinedWallet, WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';

export const useDecodedRemoveWallet = (call?: Call) =>
  useWallet(
    useMemo((): WalletId | undefined => {
      const ref = tryDecodeRemoveWalletData(call?.data)?.ref;

      return ref && call
        ? {
            ref,
            accountAddr: call.to,
            id: getWalletId(call.to, ref),
          }
        : undefined;
    }, [call]),
  );

export const getRemoveWalletMethodName = (wallet: CombinedWallet) =>
  `Remove wallet: ${wallet.name}`;

export interface RemoveWalletMethodProps {
  call: Call;
}

export const RemoveWalletMethod = memo(({ call }: RemoveWalletMethodProps) => {
  const wallet = useDecodedRemoveWallet(call);

  if (!wallet) return <Suspend />;

  return <Text variant="titleMedium">{getRemoveWalletMethodName(wallet)}</Text>;
});
