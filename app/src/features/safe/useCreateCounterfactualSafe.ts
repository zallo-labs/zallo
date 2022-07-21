import { useWallet } from '@features/wallet/useWallet';
import {
  randomDeploySalt,
  PERCENT_THRESHOLD,
  randomGroupRef,
  calculateProxyAddress,
} from 'lib';
import { useCallback } from 'react';
import { useUpsertSafe, UpsertableGroup } from '~/mutations/useUpsertSafe.api';
import { SAFE_IMPL } from '~/provider';
import { useSafeProxyFactory } from './useSafeProxyFactory';

export const useCreateCounterfactualSafe = () => {
  const wallet = useWallet();
  const factory = useSafeProxyFactory();
  const upsertSafe = useUpsertSafe();

  return useCallback(async () => {
    const group: UpsertableGroup = {
      ref: randomGroupRef(),
      approvers: [{ addr: wallet.address, weight: PERCENT_THRESHOLD }],
      name: '',
    };

    const deploySalt = randomDeploySalt();
    const safe = await calculateProxyAddress(
      { group, impl: SAFE_IMPL },
      factory,
      deploySalt,
    );

    await upsertSafe({
      safe,
      deploySalt,
      name: '',
      groups: [group],
    });

    return safe;
  }, [factory, upsertSafe, wallet.address]);
};
