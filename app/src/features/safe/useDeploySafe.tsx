import { deploySafeProxy } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { showInfo, showSuccess } from '@components/ToastProvider';
import { isDeployedState, useIsDeployed } from './useIsDeployed';
import { useSetRecoilState } from 'recoil';
import { useSafeProxyFactory } from './useSafeProxyFactory';
import { hexlify, parseEther } from 'ethers/lib/utils';
import { useWallet } from '@features/wallet/useWallet';
import { CHAIN, SAFE_IMPL } from '~/provider';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useUpsertSafe } from '~/mutations/useUpsertSafe.api';
import { useCallback } from 'react';

const deployCost = parseEther('0.0001');

export const useDeploySafe = () => {
  const combinedSafe = useSafe();
  const { groups, deploySalt, safe } = combinedSafe;
  const isDeployed = useIsDeployed();
  const factory = useSafeProxyFactory();
  const upsertSafe = useUpsertSafe();
  const setIsDeployed = useSetRecoilState(isDeployedState(safe.address));
  const wallet = useWallet();
  const faucet = useFaucet(wallet.address);

  const deploy = useCallback(async () => {
    showInfo({ text1: 'Deploying safe...', autoHide: false });

    if (CHAIN.isTestnet) {
      const walletBalance = await wallet.getBalance();
      if (walletBalance.lt(deployCost)) await faucet();
    }

    const group = groups[0];
    const r = await deploySafeProxy(
      { group, impl: combinedSafe.impl },
      factory,
      deploySalt,
    );
    await r.safe.deployed();

    setIsDeployed(true);

    if (!deploySalt && r.salt)
      upsertSafe({ ...combinedSafe, deploySalt: hexlify(r.salt) });

    showSuccess('Safe deployed');
  }, [
    combinedSafe,
    deploySalt,
    factory,
    faucet,
    groups,
    setIsDeployed,
    upsertSafe,
    wallet,
  ]);

  return !isDeployed ? deploy : undefined;
};
