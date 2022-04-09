import { ReactNode } from 'react';

import { Box, BoxProps } from '../Box';

export interface SplitItemSection {
  Top?: ReactNode;
  Bottom?: ReactNode;
}

export type ItemSectionType = ReactNode | SplitItemSection;

const isSplitItemSection = (s?: ItemSectionType): s is SplitItemSection =>
  typeof s === 'object' && ('Top' in s || 'Bottom' in s);

export interface ListItemSectionProps extends BoxProps {
  Section?: ItemSectionType;
}

export const ListItemSection = ({ Section: S, ...boxProps }: ListItemSectionProps) => {
  if (!S) return null;

  return (
    <Box vertical justifyContent="center" {...boxProps}>
      {isSplitItemSection(S) ? (
        <>
          {S.Top}
          {S.Bottom}
        </>
      ) : (
        <>{S}</>
      )}
    </Box>
  );
};
