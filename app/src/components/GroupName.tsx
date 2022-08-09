import { useMemo } from 'react';
import { elipseTruncate } from '@util/format';
import { CombinedWallet } from '~/queries/wallets';

export const effectiveGroupName = ({ name, ref }: CombinedWallet) =>
  name || `Group ${elipseTruncate(ref, 6, 4)}`;

export interface GroupNameProps {
  group: CombinedWallet;
}

export const GroupName = ({ group }: GroupNameProps) => {
  const formatted = useMemo(() => effectiveGroupName(group), [group]);

  return <>{formatted}</>;
};
