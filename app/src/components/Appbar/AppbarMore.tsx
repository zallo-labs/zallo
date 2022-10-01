import { MoreVerticalIcon } from '@theme/icons';
import { FC, useCallback, useState } from 'react';
import { Appbar, Menu } from 'react-native-paper';

interface ChildProps {
  close: () => void;
}

export interface AppbarMoreProps {
  children: FC<ChildProps>;
}

export const AppbarMore = ({ children: Child }: AppbarMoreProps) => {
  const [visible, setVisible] = useState(false);
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  return (
    <Menu
      anchor={<Appbar.Action icon={MoreVerticalIcon} onPress={openMenu} />}
      visible={visible}
      onDismiss={closeMenu}
    >
      <Child close={closeMenu} />
    </Menu>
  );
};
