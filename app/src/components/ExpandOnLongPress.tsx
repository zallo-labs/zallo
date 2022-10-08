import { ReactNode, useCallback, useState } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

export interface ExpandOnLongPress {
  collapsed: ReactNode;
  expanded: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ExpandOnLongPress = ({
  expanded,
  collapsed,
  style,
}: ExpandOnLongPress) => {
  const [isExpanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  return (
    <TouchableOpacity onLongPress={toggle} style={style}>
      {isExpanded ? expanded : collapsed}
    </TouchableOpacity>
  );
};
