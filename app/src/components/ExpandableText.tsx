import { FC, useMemo } from 'react';
import { elipseTruncate } from '~/util/format';
import { ExpandOnLongPress } from './ExpandOnLongPress';

export type ExpandableTextProps = {
  children: FC<{ value: string }>;
  value: string;
  beginLen?: number;
  endLen?: number;
};

export const ExpandableText = ({
  children: Component,
  value,
  beginLen = 3,
  endLen = beginLen,
}: ExpandableTextProps) => {
  const truncated = useMemo(
    () => elipseTruncate(value, beginLen, endLen),
    [beginLen, endLen, value],
  );

  return (
    <ExpandOnLongPress
      collapsed={<Component value={truncated} />}
      expanded={<Component value={value} />}
    />
  );
};
