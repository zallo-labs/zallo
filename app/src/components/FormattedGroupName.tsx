import { useMemo } from 'react';
import { elipseTruncate } from '@util/format';
import { CombinedGroup } from '~/queries/safe';

export const effectiveGroupName = ({ name, ref }: CombinedGroup) =>
  name || elipseTruncate(ref, 6, 4);

export interface GroupNameProps {
  group: CombinedGroup;
}

export const GroupName = ({ group }: GroupNameProps) => {
  const formatted = useMemo(() => effectiveGroupName(group), [group]);

  return <>{formatted}</>;
};
