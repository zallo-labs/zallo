import { PolicyGuid } from 'lib';
import { useMemo } from 'react';
import { useAccount } from '../account';

export const usePolicy = (guid: PolicyGuid) => {
  const account = useAccount(guid.account);

  return useMemo(() => {
    const p = account.policies.find((p) => p.key === guid.key);
    if (!p) throw new Error(`Policy not found: ${guid}`);
    return p;
  }, [account.policies, guid]);
};
