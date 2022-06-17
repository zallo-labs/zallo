import { usePropose } from '@features/execute/ProposeProvider';
import { useSafe } from '@features/safe/SafeProvider';
import { Group, hashGroup, createOp, toSafeGroup } from 'lib';
import { useCallback } from 'react';

export const useUpsertSafeGroup = () => {
  const { safe } = useSafe();
  const propose = usePropose();

  const upsert = useCallback(
    async (cur: Group, prev?: Group) => {
      const curHash = hashGroup(cur);
      const prevHash = prev && hashGroup(prev);
      if (curHash === prevHash) return;

      const addOp = createOp({
        to: safe.address,
        data: safe.interface.encodeFunctionData('addGroup', [
          toSafeGroup(cur).approvers,
        ]),
      });

      if (!prev) return propose(addOp);

      const rmOp = createOp({
        to: safe.address,
        data: safe.interface.encodeFunctionData('removeGroup', [prevHash]),
      });

      return propose([addOp, rmOp], {
        replaceGroup: {
          prevHash,
          newHash: curHash,
        },
      });
    },
    [safe, propose],
  );

  return upsert;
};
