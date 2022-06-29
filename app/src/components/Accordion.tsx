import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FC, ReactNode, useCallback, useState } from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Subheading, useTheme } from 'react-native-paper';
import { Box, BoxProps } from './Box';
import { Chevron } from './Chevron';
import { SECONDARY_ICON_SIZE } from './list/Item';

export interface AccordionProps extends BoxProps {
  children: ReactNode;
  left?: FC<{ color: string }>;
  title: string;
  initiallyExpanded?: boolean;
}

export const Accordion = ({
  children,
  left: Left,
  title,
  initiallyExpanded,
  ...boxProps
}: AccordionProps) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  const style = expanded
    ? { color: colors.primary }
    : { color: colors.onBackground };

  return (
    <>
      <TouchableOpacity onPress={toggle}>
        <Box horizontal alignItems="center" {...boxProps}>
          {Left && (
            <Box mr={2}>
              <Left {...style} />
            </Box>
          )}

          <Box flex={1}>
            <Subheading style={style}>{title}</Subheading>
          </Box>

          <Chevron
            expanded={expanded}
            size={SECONDARY_ICON_SIZE}
            color={colors.onSurface}
          />
        </Box>
      </TouchableOpacity>

      <Collapsible collapsed={!expanded}>{children}</Collapsible>
    </>
  );
};
