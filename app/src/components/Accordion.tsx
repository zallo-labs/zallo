import { FC, ReactNode, useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Subheading, useTheme } from 'react-native-paper';
import { Box, BoxProps } from './Box';
import { Chevron } from './Chevron';

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
  const { colors, iconSize } = useTheme();
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
            size={iconSize.small}
            color={colors.onSurface}
          />
        </Box>
      </TouchableOpacity>

      <Collapsible collapsed={!expanded}>{children}</Collapsible>
    </>
  );
};
