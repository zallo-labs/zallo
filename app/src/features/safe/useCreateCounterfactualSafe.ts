import { useWallet } from '@features/wallet/useWallet';
import {
  calculateSafeAddress,
  getRandomDeploySalt,
  PERCENT_THRESHOLD,
  randomGroupRef,
} from 'lib';
import { useCallback } from 'react';
import { UpsertableGroup, useUpsertSafe } from '~/mutations/useUpsertSafe';
import { useSafeFactory } from './useSafeFactory';

export const useCreateCounterfactualSafe = () => {
  const wallet = useWallet();
  const factory = useSafeFactory();
  const upsertSafe = useUpsertSafe();

  return useCallback(async () => {
    const group: UpsertableGroup = {
      ref: randomGroupRef(),
      approvers: [{ addr: wallet.address, weight: PERCENT_THRESHOLD }],
      name: '',
    };

    const deploySalt = getRandomDeploySalt();
    const safe = await calculateSafeAddress({ group }, factory, deploySalt);

    await upsertSafe({ safe, deploySalt, name: '', groups: [group] });

    return safe;
  }, [factory, upsertSafe, wallet.address]);
};
