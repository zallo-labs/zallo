import { FC, ReactNode, useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Subheading, useTheme } from 'react-native-paper';
import { Box, BoxProps } from './Box';
import { Chevron } from './Chevron';

export interface AccordionProps extends BoxProps {
  children: ReactNode;
  left?: FC<{ color: string; size: number }>;
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

  const color = expanded ? colors.onSurface : colors.placeholder;

  return (
    <>
      <TouchableOpacity onPress={toggle}>
        <Box horizontal alignItems="center" {...boxProps}>
          {Left && (
            <Box mr={2}>
              <Left color={color} size={iconSize.small} />
            </Box>
          )}

          <Box flex={1}>
            <Subheading style={{ color }}>{title}</Subheading>
          </Box>

          <Chevron expanded={expanded} size={iconSize.small} color={color} />
        </Box>
      </TouchableOpacity>

      {expanded && children}
    </>
  );
};
