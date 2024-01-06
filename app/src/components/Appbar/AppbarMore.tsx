import { FC, useCallback, useState } from 'react';
import { Menu } from 'react-native-paper';

import { IconProps, MoreVerticalIcon } from '~/util/theme/icons';

interface ChildProps {
  close: () => void;
}

export interface AppbarMoreProps {
  children: FC<ChildProps>;
  iconProps?: IconProps;
}

export function AppbarMore({ children: Child, iconProps }: AppbarMoreProps) {
  const [visible, setVisible] = useState(false);
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  return (
    <Menu
      anchor={<MoreVerticalIcon {...iconProps} onPress={openMenu} />}
      visible={visible}
      onDismiss={closeMenu}
    >
      <Child close={closeMenu} />
    </Menu>
  );
}
