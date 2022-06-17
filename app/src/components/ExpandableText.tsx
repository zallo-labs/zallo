import { elipseTruncate } from '@util/format';
import { FC, useMemo } from 'react';
import { ExpandOnLongPress } from './ExpandOnLongPress';

export type ExpandableTextProps = {
  children: FC<{ text: string }>;
  text: string;
  beginLen?: number;
  endLen?: number;
};

export const ExpandableText = ({
  children: Component,
  text,
  beginLen = 3,
  endLen = 3,
}: ExpandableTextProps) => {
  const truncated = useMemo(
    () => elipseTruncate(text, beginLen, endLen),
    [beginLen, endLen, text],
  );

  return (
    <ExpandOnLongPress
      collapsed={<Component text={truncated} />}
      expanded={<Component text={text} />}
    />
  );
};
