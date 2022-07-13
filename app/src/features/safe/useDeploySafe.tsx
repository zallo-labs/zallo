import { deploySafe } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { showInfo, showSuccess } from '@components/Toast';
import { isDeployedState, useIsDeployed } from './useIsDeployed';
import { useSetRecoilState } from 'recoil';
import { useSafeFactory } from './useSafeFactory';
import { hexlify, parseEther } from 'ethers/lib/utils';
import { useWallet } from '@features/wallet/useWallet';
import { CHAIN } from '~/provider';
import { useFaucet } from '~/mutations/useFacuet.api';
import { useUpsertSafe } from '~/mutations/useUpsertSafe.api';

const deployCost = parseEther('0.0001');

export const useDeploySafe = () => {
  const combinedSafe = useSafe();
  const { groups, deploySalt, safe } = combinedSafe;
  const isDeployed = useIsDeployed();
  const factory = useSafeFactory();
  const upsertSafe = useUpsertSafe();
  const setIsDeployed = useSetRecoilState(isDeployedState(safe.address));
  const wallet = useWallet();
  const faucet = useFaucet(wallet.address);

  if (isDeployed) return undefined;

  const deploy = async () => {
    if (CHAIN.isTestnet) {
      const walletBalance = await wallet.getBalance();
      if (walletBalance.lt(deployCost)) await faucet();
    }

    showInfo({ text1: 'Deploying safe...', visibilityTime: 8000 });

    const group = groups[0];
    const r = await deploySafe({
      factory,
      args: { group },
      salt: deploySalt,
    });
    await r.safe.deployed();

    setIsDeployed(true);

    if (!deploySalt && r.salt)
      upsertSafe({ ...combinedSafe, deploySalt: hexlify(r.salt) });

    showSuccess('Safe deployed');
  };

  return deploy;
};
