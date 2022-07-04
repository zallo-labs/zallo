import { useMemo } from 'react';
import { CombinedGroup } from '~/queries';
import { elipseTruncate } from '@util/format';

export const effectiveGroupName = ({ name, ref }: CombinedGroup) =>
  name || elipseTruncate(ref, 6, 4);

export interface GroupNameProps {
  group: CombinedGroup;
}

export const GroupName = ({ group }: GroupNameProps) => {
  const formatted = useMemo(() => effectiveGroupName(group), [group]);

  return <>{formatted}</>;
};
