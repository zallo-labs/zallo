import { useMemo } from 'react';
import { elipseTruncate } from '@util/format';
import { CombinedGroup } from '~/queries/safe';

export const effectiveAccountName = ({ name, ref }: CombinedGroup) =>
  name || `Account ${elipseTruncate(ref, 6, 4)}`;

export interface AccountNameProps {
  account: CombinedGroup;
}

export const AccountName = ({ account }: AccountNameProps) => {
  const formatted = useMemo(() => effectiveAccountName(account), [account]);

  return <>{formatted}</>;
};
