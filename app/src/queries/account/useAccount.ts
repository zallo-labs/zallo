import { useDevice } from '@features/device/useDevice';
import { combineRest } from '@gql/combine';
import { Address, connectAccount, toId } from 'lib';
import { useMemo } from 'react';
import { ACCOUNT_IMPL } from '~/provider';
import { CombinedAccount } from '.';
import { useApiAccount } from './useAccount.api';
import { useSubAccount } from './useAccount.sub';

export const useAccount = (accountAddr: Address) => {
  const device = useDevice();
  const { data: subAccount, ...subRest } = useSubAccount(accountAddr);
  const { data: apiAccount, ...apiRest } = useApiAccount(accountAddr);

  const account = useMemo(
    (): CombinedAccount => ({
      id: toId(accountAddr),
      contract: connectAccount(accountAddr, device),
      impl: subAccount?.impl ?? apiAccount?.impl ?? ACCOUNT_IMPL,
      deploySalt: apiAccount?.deploySalt,
      name: apiAccount?.name ?? '',
    }),
    [
      accountAddr,
      device,
      subAccount?.impl,
      apiAccount?.impl,
      apiAccount?.deploySalt,
      apiAccount?.name,
    ],
  );

  const rest = useMemo(() => combineRest(subRest, apiRest), [apiRest, subRest]);

  return { account, ...rest };
};
