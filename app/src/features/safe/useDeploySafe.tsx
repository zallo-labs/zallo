import { deploySafe } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { useUpsertSafe } from '~/mutations/useUpsertSafe';
import { showInfo, showSuccess } from '@components/Toast';
import { isDeployedState, useIsDeployed } from './useIsDeployed';
import { useSetRecoilState } from 'recoil';
import { useSafeFactory } from './useSafeFactory';

export const useDeploySafe = () => {
  const { groups, deploySalt, safe } = useSafe();
  const isDeployed = useIsDeployed();
  const wallet = useWallet();
  const factory = useSafeFactory();
  const upsertSafe = useUpsertSafe();
  const setIsDeployed = useSetRecoilState(isDeployedState(safe.address));

  if (isDeployed) return undefined;

  const deploy = async () => {
    showInfo({ text1: 'Deploying safe...', visibilityTime: 8000 });

    const group = groups[0];

    const r = await deploySafe({
      factory,
      args: { group },
      signer: wallet,
      salt: deploySalt,
    });
    await r.safe.deployed();

    setIsDeployed(true);

    if (!deploySalt && r.salt) upsertSafe({ deploySalt: r.salt });

    showSuccess('Safe deployed');
  };

  return deploy;
};
