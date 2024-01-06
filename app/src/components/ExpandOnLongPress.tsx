import { ReactNode } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { useToggle } from '~/hooks/useToggle';

export interface ExpandOnLongPress extends Pick<TouchableOpacityProps, 'onPress' | 'style'> {
  collapsed: ReactNode;
  expanded: ReactNode;
}

export const ExpandOnLongPress = ({
  expanded,
  collapsed,
  ...touchableProps
}: ExpandOnLongPress) => {
  const [isExpanded, toggleExpanded] = useToggle(false);

  return (
    <TouchableOpacity onLongPress={toggleExpanded} {...touchableProps}>
      {isExpanded ? expanded : collapsed}
    </TouchableOpacity>
  );
};
