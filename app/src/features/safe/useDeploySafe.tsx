import { deploySafe } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { useUpsertSafe } from '~/mutations/useUpsertSafe';
import { showInfo, showSuccess } from '@components/Toast';
import { isDeployedState, useIsDeployed } from './useIsDeployed';
import { useSetRecoilState } from 'recoil';
import { useSafeFactory } from './useSafeFactory';
import { hexlify } from 'ethers/lib/utils';

export const useDeploySafe = () => {
  const combinedSafe = useSafe();
  const { groups, deploySalt, safe } = combinedSafe;
  const isDeployed = useIsDeployed();
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
