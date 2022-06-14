import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FC, ReactNode, useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Paragraph, Subheading, useTheme } from 'react-native-paper';
import { Box, BoxProps } from './Box';
import { PRIMARY_ICON_SIZE, SECONDARY_ICON_SIZE } from './list/Item';

export interface AccordionProps extends BoxProps {
  children: ReactNode;
  left?: FC<{ color: string }>;
  title: string;
}

export const Accordion = ({
  children,
  left: Left,
  title,
  ...boxProps
}: AccordionProps) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  const style = expanded
    ? { color: colors.primary }
    : { color: colors.onBackground };

  return (
    <>
      <Pressable onPress={toggle}>
        <Box horizontal alignItems="center" {...boxProps}>
          {Left && (
            <Box mr={2}>
              <Left {...style} />
            </Box>
          )}

          <Box flex={1}>
            <Subheading style={style}>{title}</Subheading>
          </Box>

          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={SECONDARY_ICON_SIZE}
            style={{ color: colors.onBackground }}
          />
        </Box>
      </Pressable>

      <Collapsible collapsed={!expanded}>{children}</Collapsible>
    </>
  );
};
