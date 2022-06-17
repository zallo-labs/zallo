import { useMemo } from 'react';
import { CombinedGroup } from '~/queries';
import { hexlify } from 'ethers/lib/utils';

export interface GroupNameProps {
  group: CombinedGroup;
}

export const GroupName = ({ group: { name, hash } }: GroupNameProps) => {
  const formatted = useMemo(() => {
    if (name) return name;

    const hex = hexlify(hash);
    return `${hex.slice(0, 6)}...${hex.slice(hash.length - 4)}`;
  }, [name, hash]);

  return <>{formatted}</>;
};
