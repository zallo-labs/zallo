import { Box, BoxProps } from '../Box';
import { ItemSectionType, ListItemSection } from './ListItemSection';

export interface ListItemProps extends BoxProps {
  Left?: ItemSectionType;
  Main?: ItemSectionType;
  CenterRight?: ItemSectionType;
  Right?: ItemSectionType;
}

export const ListItem = ({ Left, Main, CenterRight, Right, ...boxProps }: ListItemProps) => (
  <Box horizontal justifyContent="space-between" alignItems="center" {...boxProps}>
    <Box horizontal justifyContent="flex-start" minWidth="40%">
      <ListItemSection Section={Left} mr={3} />
      <ListItemSection Section={Main} />
    </Box>

    <ListItemSection Section={CenterRight} />
    <ListItemSection Section={Right} />
  </Box>
);
