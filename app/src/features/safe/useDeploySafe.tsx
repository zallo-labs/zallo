import { ethers } from 'ethers';

import { deploySafe, getFactory } from 'lib';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/WalletProvider';
import { useUpdateSafe } from '@gql/mutations/useUpdateSafe';
import { showInfo, showSuccess } from '@components/Toast';
import { CONFIG } from '~/config';
import { CHAIN } from '~/provider';
import { useIsDeployed } from './useIsDeployed';

export const useDeploySafe = () => {
  const { groups, deploySalt } = useSafe();
  const isDeployed = useIsDeployed();
  const wallet = useWallet();
  const updateSafe = useUpdateSafe();

  if (isDeployed) return undefined;

  const deploy = async () => {
    showInfo({ text1: 'Deploying safe...', visibilityTime: 8000 });

    const r = await deploySafe({
      factory: getFactory(CONFIG.factory[CHAIN.name], wallet),
      deployer: wallet,
      group: groups[0].approvers,
      salt: deploySalt,
    });
    await r.safe.deployed();

    console.log({
      safe: r.safe.address,
      salt: r.salt,
    });

    if (!deploySalt && r.salt) {
      console.log('Updating deploySalt');
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
