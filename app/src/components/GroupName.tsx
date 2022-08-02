import { useMemo } from 'react';
import { elipseTruncate } from '@util/format';
import { CombinedAccount } from '~/queries/accounts';

export const effectiveGroupName = ({ name, ref }: CombinedAccount) =>
  name || `Group ${elipseTruncate(ref, 6, 4)}`;

export interface GroupNameProps {
  group: CombinedAccount;
}

export const GroupName = ({ group }: GroupNameProps) => {
  const formatted = useMemo(() => effectiveGroupName(group), [group]);

  return <>{formatted}</>;
};
