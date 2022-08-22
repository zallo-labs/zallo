import { deployAccountProxy } from 'lib';
import { showInfo, showSuccess } from '@components/ToastProvider';
import { useIsDeployed, useSetDeployed } from './useIsDeployed';
import { useAccountProxyFactory } from './useAccountProxyFactory';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/account';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import assert from 'assert';
import { useDevice } from '@features/device/useDevice';
import { useFaucet } from '~/mutations/useFacuet.api';

export const useDeployAccount = (account: CombinedAccount) => {
  const isDeployed = useIsDeployed(account.addr);
  const factory = useAccountProxyFactory();
  const setDeployed = useSetDeployed(account.addr);
  const device = useDevice();
  const faucet = useFaucet(device.address);

  const deploy = useCallback(
    async (wallet: CombinedWallet) => {
      showInfo({ text1: 'Deploying account...', autoHide: false });

      await faucet?.();

      const deploySalt = account.deploySalt;
      assert(deploySalt);

      const r = await deployAccountProxy(
        { impl: account.impl, wallet: toWallet(wallet) },
        factory,
        deploySalt,
      );
      await r.account.deployed();

      setDeployed(true);
      showSuccess('Account deployed');
    },
    [account.deploySalt, account.impl, factory, faucet, setDeployed],
  );

  return !isDeployed ? deploy : undefined;
};
