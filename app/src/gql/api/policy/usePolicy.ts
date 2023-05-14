import assert from 'assert';
import { PolicyId } from 'lib';
import { useMemo } from 'react';
import { useAccount } from '../account';
import { WPolicy } from './types';

export const usePolicy = <G extends PolicyId | undefined>(id: G) => {
  const account = useAccount(id);

  const p = useMemo(() => {
    if (!id) return undefined;
    return account?.policies.find((p) => p.key === id.key);
  }, [account?.policies, id]);

  if (id) assert(p, `Policy not found: ${id}`);
  return p as G extends undefined ? WPolicy | undefined : WPolicy;
};
