import { IconProps, MoreVerticalIcon } from '@theme/icons';
import { FC, useCallback, useState } from 'react';
import { Appbar, Menu } from 'react-native-paper';

interface ChildProps {
  close: () => void;
}

export interface AppbarMoreProps {
  children: FC<ChildProps>;
  iconProps?: IconProps;
}

export const AppbarMore = ({ children: Child, iconProps }: AppbarMoreProps) => {
  const [visible, setVisible] = useState(false);
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  return (
    <Menu
      anchor={
        <Appbar.Action
          icon={(props) => <MoreVerticalIcon {...props} {...iconProps} />}
          onPress={openMenu}
          animated={false}
        />
      }
      visible={visible}
      onDismiss={closeMenu}
    >
      <Child close={closeMenu} />
    </Menu>
  );
};

export const AppbarMore2 = ({ children: Child, iconProps }: AppbarMoreProps) => {
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
};
