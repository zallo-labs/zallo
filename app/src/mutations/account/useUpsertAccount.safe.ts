import { usePropose } from '@features/execute/ProposeProvider';
import { Account, accountEquiv, createUpsertAccountTx } from 'lib';
import { useCallback } from 'react';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';

export const useUpsertSafeAccount = () => {
  const { safe } = useSelectedAccount();
  const propose = usePropose();

  const upsert = useCallback(
    async (cur: Account, prev?: Account) => {
      if (prev && accountEquiv(cur, prev))
        throw new Error('Upserting account when cur ≡ prev');

      return await propose(createUpsertAccountTx(safe.contract, cur));
    },
    [safe.contract, propose],
  );

  return upsert;
};
