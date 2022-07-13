import { usePropose } from '@features/execute/ProposeProvider';
import { useSafe } from '@features/safe/SafeProvider';
import { createUpsertGroupTx, Group, groupEquiv } from 'lib';
import { useCallback } from 'react';

export const useUpsertSafeGroup = () => {
  const { safe } = useSafe();
  const propose = usePropose();

  const upsert = useCallback(
    async (cur: Group, prev?: Group) => {
      if (prev && groupEquiv(cur, prev))
        throw new Error('Upserting group when cur ≡ prev');

      return await propose(createUpsertGroupTx(safe, cur));
    },
    [safe, propose],
  );

  return upsert;
};
