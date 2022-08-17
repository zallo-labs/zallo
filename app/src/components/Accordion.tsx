import { useTheme } from '@util/theme/paper';
import { ReactNode, useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Box } from './Box';
import { Chevron } from './Chevron';

export interface AccordionProps {
  children: ReactNode;
  title: ReactNode;
  initiallyExpanded?: boolean;
}

export const Accordion = ({
  children,
  title,
  initiallyExpanded,
}: AccordionProps) => {
  const { colors, iconSize } = useTheme();

  const [expanded, setExpanded] = useState(!!initiallyExpanded);
  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  const color = expanded ? colors.onSurface : colors.onSurfaceOpaque;

  return (
    <Box>
      <TouchableOpacity onPress={toggle}>
        <Box horizontal justifyContent="space-between" alignItems="center">
          <Box>{title}</Box>

          <Chevron expanded={expanded} size={iconSize.small} color={color} />
        </Box>
      </TouchableOpacity>

      <Collapsible collapsed={!expanded}>{children}</Collapsible>
    </Box>
  );
};
