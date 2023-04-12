import assert from 'assert';
import { PolicyId } from 'lib';
import { useMemo } from 'react';
import { asAccountId, useAccount } from '../account';
import { WPolicy } from './types';

export const usePolicy = <G extends PolicyId | undefined>(guid: G) => {
  const account = useAccount(asAccountId(guid));

  const p = useMemo(() => {
    if (!guid) return undefined;
    return account?.policies.find((p) => p.key === guid.key);
  }, [account?.policies, guid]);

  if (guid) assert(p, `Policy not found: ${guid}`);
  return p as G extends undefined ? WPolicy | undefined : WPolicy;
};
