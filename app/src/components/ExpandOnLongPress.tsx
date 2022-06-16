import { ReactNode, useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';

export interface ExpandOnLongPress {
  collapsed: ReactNode;
  expanded: ReactNode;
}

export const ExpandOnLongPress = (props: ExpandOnLongPress) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  return (
    <TouchableOpacity onLongPress={toggle}>
      {expanded ? props.expanded : props.collapsed}
    </TouchableOpacity>
  );
};
