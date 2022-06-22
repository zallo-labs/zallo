import { useMemo } from 'react';
import { CombinedGroup } from '~/queries';
import { elipseTruncate } from '@util/format';
import { hexlify } from 'ethers/lib/utils';

export interface GroupNameProps {
  group: CombinedGroup;
}

export const GroupName = ({ group: { name, ref } }: GroupNameProps) => {
  const formatted = useMemo(
    () => name || elipseTruncate(hexlify(ref), 6, 4),
    [name, ref],
  );

  return <>{formatted}</>;
};
