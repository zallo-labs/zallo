import { useTheme } from '@theme/paper';
import { ReactNode, useCallback, useState } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Box } from '~/components/layout/Box';
import { Chevron } from './Chevron';

export interface AccordionProps {
  children: ReactNode;
  title: ReactNode;
  initiallyExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Accordion = ({
  children,
  title,
  initiallyExpanded,
  style,
}: AccordionProps) => {
  const { colors, iconSize } = useTheme();

  const [expanded, setExpanded] = useState(!!initiallyExpanded);
  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  return (
    <Box style={style}>
      <TouchableOpacity onPress={toggle}>
        <Box horizontal justifyContent="space-between" alignItems="center">
          <Box>{title}</Box>

          <Chevron
            expanded={expanded}
            size={iconSize.small}
            color={colors.onSurfaceOpaque}
          />
        </Box>
      </TouchableOpacity>

      <Collapsible collapsed={!expanded}>
        <Box my={2}>{children}</Box>
      </Collapsible>
    </Box>
  );
};
