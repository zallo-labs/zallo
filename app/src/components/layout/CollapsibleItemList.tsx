import { CORNER } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';

export interface CollapsableItemListProps {
  expanded: boolean;
  children: ReactNode;
}

export function CollapsibleItemList({ expanded, children }: CollapsableItemListProps) {
  const { styles } = useStyles(stylesheet);

  const items = React.Children.toArray(children);

  if (!items.length) return null;

  return (
    <View style={styles.container}>
      <View style={expanded ? styles.expandedHeader : styles.collapsedHeader}>{items[0]}</View>

      <Collapsible collapsed={!expanded} style={[styles.container, styles.expandedContainer]}>
        {items.slice(1)}
      </Collapsible>
    </View>
  );
}

const stylesheet = createStyles((_theme) => ({
  container: {
    overflow: 'hidden',
    gap: 4,
  },
  collapsedHeader: {
    overflow: 'hidden',
    borderRadius: CORNER.l,
  },
  expandedHeader: {
    overflow: 'hidden',
    borderTopLeftRadius: CORNER.l,
    borderTopRightRadius: CORNER.l,
  },
  expandedContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: CORNER.l,
    borderBottomRightRadius: CORNER.l,
  },
}));
