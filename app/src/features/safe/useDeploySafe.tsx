import { ethers } from 'ethers';

import { deploySafe, getFactory } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/WalletProvider';
import { useUpdateSafe } from '@gql/mutations/useUpdateSafe';
import { showInfo, showSuccess } from '@components/Toast';
import { CONFIG } from '~/config';
import { useIsDeployed } from './useIsDeployed';

export const useDeploySafe = () => {
  const { groups, deploySalt } = useSafe();
  const isDeployed = useIsDeployed();
  const wallet = useWallet();
  const updateSafe = useUpdateSafe();

  if (isDeployed) return undefined;

  const deploy = async () => {
    showInfo({ text1: 'Deploying safe...', visibilityTime: 8000 });

    const group = groups[0];

    const r = await deploySafe({
      factory: getFactory(CONFIG.factoryAddress, wallet),
      args: [group.approvers],
      signer: wallet,
      salt: deploySalt,
    });
    await r.safe.deployed();

    if (!deploySalt && r.salt) {
      await updateSafe({
        deploySalt: {
          set: ethers.utils.hexlify(r.salt),
        },
      });
    }

    showSuccess({ text1: 'Safe deployed' });
  };

  return deploy;
};
