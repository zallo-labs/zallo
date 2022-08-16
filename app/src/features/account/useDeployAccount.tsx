import { deployAccountProxy } from 'lib';
import { showInfo, showSuccess } from '@components/ToastProvider';
import { useIsDeployed, useSetDeployed } from './useIsDeployed';
import { useAccountProxyFactory } from './useAccountProxyFactory';
import { parseEther } from 'ethers/lib/utils';
import { useDevice } from '@features/device/useDevice';
import { CHAIN } from '~/provider';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/account';
import { CombinedWallet, toWallet } from '~/queries/wallets';
import assert from 'assert';

const deployCost = parseEther('0.0001');

export const useDeployAccount = (
  account: CombinedAccount,
  wallet: CombinedWallet,
) => {
  const device = useDevice();
  const isDeployed = useIsDeployed(account.addr);
  const factory = useAccountProxyFactory();
  const setDeployed = useSetDeployed(account.addr);
  const faucet = useFaucet(device.address);

  const deploy = useCallback(async () => {
    showInfo({ text1: 'Deploying account...', autoHide: false });

    if (CHAIN.isTestnet) {
      const walletBalance = await device.getBalance();
      if (walletBalance.lt(deployCost)) await faucet();
    }

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
  }, [
    account.deploySalt,
    account.impl,
    wallet,
    factory,
    setDeployed,
    device,
    faucet,
  ]);

  return !isDeployed ? deploy : undefined;
};
