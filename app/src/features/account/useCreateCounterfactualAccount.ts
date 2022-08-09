import { useDevice } from '@features/device/useDevice';
import {
  randomDeploySalt,
  PERCENT_THRESHOLD,
  randomGroupRef,
  calculateProxyAddress,
} from 'lib';
import { useCallback } from 'react';
import {
  useUpsertAccount,
  UpsertableGroup,
} from '~/mutations/useUpsertAccount.api';
import { ACCOUNT_IMPL } from '~/provider';
import { useAccountProxyFactory } from './useAccountProxyFactory';

export const useCreateCounterfactualAccount = () => {
  const device = useDevice();
  const factory = useAccountProxyFactory();
  const upsertAccount = useUpsertAccount();

  return useCallback(async () => {
    const group: UpsertableGroup = {
      ref: randomGroupRef(),
      approvers: [{ addr: device.address, weight: PERCENT_THRESHOLD }],
      name: '',
    };

    const deploySalt = randomDeploySalt();
    const account = await calculateProxyAddress(
      { group, impl: ACCOUNT_IMPL },
      factory,
      deploySalt,
    );

    await upsertAccount({
      account,
      deploySalt,
      impl: ACCOUNT_IMPL,
      name: '',
      groups: [group],
    });

    return account;
  }, [factory, upsertAccount, device.address]);
};
