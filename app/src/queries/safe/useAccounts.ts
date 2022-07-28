import { useMemo } from 'react';
import { CombinedAccount } from '.';
import { useSafes } from './useSafes';

export const useAccounts = () => {
  const { safes, ...rest } = useSafes();

  const accounts = useMemo(
    () =>
      safes.flatMap(({ groups, ...safe }) => {
        return groups.map(
          (g): CombinedAccount => ({
            ...g,
            safe,
          }),
        );
      }),
    [safes],
  );

  return { accounts, ...rest };
};
