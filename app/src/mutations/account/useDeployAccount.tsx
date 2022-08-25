import { deployAccountProxy } from 'lib';
import {
  useIsDeployed,
  useSetDeployed,
} from '../../util/network/useIsDeployed';
import { useAccountProxyFactory } from '../../util/network/useAccountProxyFactory';
import { useCallback, useState } from 'react';
import { CombinedAccount } from '~/queries/account';
import { CombinedWallet, toSafeWallet } from '~/queries/wallets';
import assert from 'assert';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useDevice } from '../../util/network/useDevice';
import { showInfo, showSuccess } from '~/provider/ToastProvider';

type Deploy = ((wallet: CombinedWallet) => Promise<void>) | undefined;

export const useDeployAccount = (
  account: CombinedAccount,
): [Deploy, boolean] => {
  const isDeployed = useIsDeployed(account.addr);
  const factory = useAccountProxyFactory();
  const setDeployed = useSetDeployed(account.addr);
  const device = useDevice();
  const faucet = useFaucet(device.address);

  const [deploying, setDeploying] = useState(false);

  const deploy = useCallback(
    async (wallet: CombinedWallet) => {
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

      setDeployed(true);
      showSuccess('Account deployed');
      setDeploying(false);
    },
    [account.deploySalt, account.impl, factory, faucet, setDeployed],
  );

  return [!isDeployed ? deploy : undefined, deploying];
};
