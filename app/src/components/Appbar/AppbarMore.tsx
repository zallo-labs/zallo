import { IconProps, MoreVerticalIcon } from '@theme/icons';
import { FC, useCallback, useState } from 'react';
import { Menu } from 'react-native-paper';

type Handle = <T>(f: (arg: T) => void) => (arg: T) => void;

interface ChildProps {
  close: () => void;
  handle: Handle;
}

export interface AppbarMoreProps {
  children: FC<ChildProps>;
  iconProps?: IconProps;
}

export function AppbarMore({ children: Child, iconProps }: AppbarMoreProps) {
  const [visible, setVisible] = useState(false);
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const handle = useCallback(
    <T,>(f: (arg: T) => void) =>
      (arg: T) => {
        closeMenu();
        f(arg);
      },
    [closeMenu],
  );

  return (
    <Menu
      anchor={<MoreVerticalIcon {...iconProps} onPress={openMenu} />}
      visible={visible}
      onDismiss={closeMenu}
    >
      <Child close={closeMenu} handle={handle} />
    </Menu>
  );
}
