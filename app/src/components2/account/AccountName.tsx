import { useMemo } from 'react';
import { elipseTruncate } from '@util/format';
import { CombinedAccount } from '~/queries/accounts';

export const effectiveAccountName = ({ name, ref }: CombinedAccount) =>
  name || `Account ${elipseTruncate(ref, 6, 4)}`;

export interface AccountNameProps {
  account: CombinedAccount;
}

export const AccountName = ({ account }: AccountNameProps) => {
  const formatted = useMemo(() => effectiveAccountName(account), [account]);

  return <>{formatted}</>;
};
