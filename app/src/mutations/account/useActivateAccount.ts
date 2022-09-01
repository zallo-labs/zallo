import { deployAccountProxy } from 'lib';
import { useAccountProxyFactory } from '../../util/network/useAccountProxyFactory';
import { useMemo, useState } from 'react';
import { CombinedAccount } from '~/queries/account';
import { toSafeWallet } from '~/queries/wallets';
import assert from 'assert';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useDevice } from '../../util/network/useDevice';
import { showInfo, showSuccess } from '~/provider/ToastProvider';
import { useAccount } from '~/queries/account/useAccount';
import { useWallet } from '~/queries/wallet/useWallet';

type Deploy = (() => Promise<void>) | undefined;

export const useActivateAccount = (
  account: CombinedAccount,
): [Deploy, boolean] => {
  const factory = useAccountProxyFactory();
  const device = useDevice();
  const faucet = useFaucet(device.address);
  const { refetch } = useAccount(account.addr);
  const wallet = useWallet(account.walletIds[0]);

  if (wallet) {
    assert(
      !wallet.state.proposedModification,
      'Account activation wallet is initial',
    );
  }

  const [deploying, setDeploying] = useState(false);

  const deploy = useMemo(
    () =>
      !account.active && wallet
        ? async () => {
            setDeploying(true);
            showInfo({ text1: 'Deploying account...', autoHide: false });

            await faucet?.();

            const deploySalt = account.deploySalt;
            assert(deploySalt);

            const r = await deployAccountProxy(
              { impl: account.impl, wallet: toSafeWallet(wallet) },
              factory,
              deploySalt,
            );
            await r.account.deployed();

            await refetch();
            showSuccess('Account deployed');
            setDeploying(false);
          }
        : undefined,
    [
      account.active,
      account.deploySalt,
      account.impl,
      factory,
      faucet,
      refetch,
      wallet,
    ],
  );

  return [deploy, deploying];
};
