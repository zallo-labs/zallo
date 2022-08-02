import { useSafeProxyFactory } from '@features/safe/useSafeProxyFactory';
import { useWallet } from '@features/wallet/useWallet';
import {
  Account,
  calculateProxyAddress,
  randomAccountRef,
  randomDeploySalt,
  toQuorum,
  toQuorums,
} from 'lib';
import { useCallback } from 'react';
import { SAFE_IMPL } from '~/provider';
import { useUpsertApiSafe } from './useUpsertSafe.api';

export const useCreateApiSafe = () => {
  const wallet = useWallet();
  const factory = useSafeProxyFactory();
  const upsertSafe = useUpsertApiSafe();

  return useCallback(
    async (safeName: string, accountName: string) => {
      const account: Account = {
        ref: randomAccountRef(),
        quorums: toQuorums([toQuorum([wallet.address])]),
      };

      const deploySalt = randomDeploySalt();

      const safeAddr = await calculateProxyAddress(
        {
          impl: SAFE_IMPL,
          account,
        },
        factory,
        deploySalt,
      );

      return await upsertSafe({
        addr: safeAddr,
        impl: SAFE_IMPL,
        deploySalt,
        name: safeName,
        accounts: [
          {
            ...account,
            name: accountName,
          },
        ],
      });
    },
    [factory, upsertSafe, wallet.address],
  );
};
