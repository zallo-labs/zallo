import { useMemo } from 'react';
import { ethers } from 'ethers';
import { CombinedGroup } from '@queries';
import { elipseTruncate } from '@util/format';

export interface FormattedGroupNameProps {
  group: CombinedGroup;
}

export const FormattedGroupName = ({
  group: { id, name, hash },
}: FormattedGroupNameProps) => {
  const formatted = useMemo(
    () => name || elipseTruncate(ethers.utils.hexlify(hash), 6, 4),
    [name, hash],
  );

  return <>{formatted}</>;
};
