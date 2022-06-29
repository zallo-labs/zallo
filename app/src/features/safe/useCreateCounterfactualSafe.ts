import { useWallet } from '@features/wallet/useWallet';
import {
  calculateSafeAddress,
  PERCENT_THRESHOLD,
  randomGroupRef,
  toSafeConstructorDeployArgs,
} from 'lib';
import { useCallback } from 'react';
import { UpsertableGroup, useUpsertSafe } from '~/mutations/useUpsertSafe';
import { useSafeFactory } from './useSafeFactory';

export const useCreateCounterfactualSafe2 = () => {
  const wallet = useWallet();
  const factory = useSafeFactory();
  const upsertSafe = useUpsertSafe();

  return useCallback(async () => {
    const group: UpsertableGroup = {
      ref: randomGroupRef(),
      approvers: [{ addr: wallet.address, weight: PERCENT_THRESHOLD }],
      name: '',
    };

    const { addr: safe, salt } = await calculateSafeAddress(
      toSafeConstructorDeployArgs({ group }),
      factory,
    );

    await upsertSafe({ safe, deploySalt: salt, name: null, groups: [group] });

    return safe;
  }, [factory, upsertSafe, wallet.address]);
};
