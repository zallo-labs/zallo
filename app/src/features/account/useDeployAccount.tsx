import { deployAccountProxy } from 'lib';
import { useAccount } from '@features/account/AccountProvider';
import { showInfo, showSuccess } from '@components/ToastProvider';
import { isDeployedState, useIsDeployed } from './useIsDeployed';
import { useSetRecoilState } from 'recoil';
import { useAccountProxyFactory } from './useAccountProxyFactory';
import { hexlify, parseEther } from 'ethers/lib/utils';
import { useDevice } from '@features/device/useDevice';
import { CHAIN, ACCOUNT_IMPL } from '~/provider';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useUpsertAccount } from '~/mutations/useUpsertAccount.api';
import { useCallback } from 'react';

const deployCost = parseEther('0.0001');

export const useDeployAccount = () => {
  const combinedAccount = useAccount();
  const { groups, deploySalt, contract: account } = combinedAccount;
  const isDeployed = useIsDeployed();
  const factory = useAccountProxyFactory();
  const upsertAccount = useUpsertAccount();
  const setIsDeployed = useSetRecoilState(isDeployedState(account.address));
  const device = useDevice();
  const faucet = useFaucet(device.address);

  const deploy = useCallback(async () => {
    showInfo({ text1: 'Deploying account...', autoHide: false });

    if (CHAIN.isTestnet) {
      const walletBalance = await device.getBalance();
      if (walletBalance.lt(deployCost)) await faucet();
    }

    const group = groups[0];
    const r = await deployAccountProxy(
      { group, impl: combinedAccount.impl },
      factory,
      deploySalt,
    );
    await r.account.deployed();

    setIsDeployed(true);

    if (!deploySalt && r.salt)
      upsertAccount({ ...combinedAccount, deploySalt: hexlify(r.salt) });

    showSuccess('Account deployed');
  }, [
    combinedAccount,
    deploySalt,
    factory,
    faucet,
    groups,
    setIsDeployed,
    upsertAccount,
    device,
  ]);

  return !isDeployed ? deploy : undefined;
};
