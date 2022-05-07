import { useMemo } from 'react';
import { Group } from '@queries';
import { hexlify } from 'ethers/lib/utils';

export interface GroupNameProps {
  group: Group;
}

export const GroupName = ({ group }: GroupNameProps) => {
  const formatted = useMemo(() => {
    const hash = hexlify(group.hash);

    return `${hash.slice(0, 6)}...${hash.slice(hash.length - 4)}`;
  }, [group.hash]);

  return <>{formatted}</>;
};
