import assert from 'assert';
import { PolicyGuid } from 'lib';
import { useMemo } from 'react';
import { asAccountId, useAccount } from '../account';
import { WPolicy } from './types';

export const usePolicy = <G extends PolicyGuid | undefined>(guid: G) => {
  const account = useAccount(asAccountId(guid));

  const p = useMemo(() => {
    if (!guid) return undefined;
    return account?.policies.find((p) => p.key === guid.key);
  }, [account?.policies, guid]);

  if (guid) assert(p, `Policy not found: ${guid}`);
  return p as G extends undefined ? WPolicy | undefined : WPolicy;
};
