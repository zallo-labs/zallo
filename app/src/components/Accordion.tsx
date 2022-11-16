import { makeStyles } from '@theme/makeStyles';
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

export const Accordion = ({ children, title, initiallyExpanded, style }: AccordionProps) => {
  const styles = useStyles();

  const [expanded, setExpanded] = useState(!!initiallyExpanded);
  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  return (
    <Box style={style}>
      <TouchableOpacity onPress={toggle} style={styles.header}>
        <Box>{title}</Box>

        <Chevron expanded={expanded} size={styles.chevron.fontSize} color={styles.chevron.color} />
      </TouchableOpacity>

      <Collapsible collapsed={!expanded}>{children}</Collapsible>
    </Box>
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    color: colors.onSurfaceOpaque,
    fontSize: iconSize.small,
  },
}));
