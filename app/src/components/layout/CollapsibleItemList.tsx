import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CORNER } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import Collapsible from 'react-native-collapsible';

export interface CollapsableItemListProps {
  expanded: boolean;
  children: ReactNode;
  duration?: number;
}

export function CollapsibleItemList({
  children,
  expanded,
  duration = 300,
}: CollapsableItemListProps) {
  const { styles } = useStyles(stylesheet);

  const items = React.Children.toArray(children);

  const headerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      borderBottomLeftRadius: withTiming(expanded ? 0 : CORNER.l, { duration }),
      borderBottomRightRadius: withTiming(expanded ? 0 : CORNER.l, { duration }),
    };
  });

  if (!items.length) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>{items[0]}</Animated.View>

      <Collapsible
        collapsed={!expanded}
        duration={duration}
        style={[styles.container, styles.expandedContainer]}
      >
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
  header: {
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
