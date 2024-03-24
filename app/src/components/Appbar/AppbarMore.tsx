import { IconProps, MoreVerticalIcon } from '@theme/icons';
import { FC, useCallback, useState } from 'react';
import { Menu } from 'react-native-paper';

interface ChildProps {
  handle: <T>(f: (arg: T) => void) => (arg: T) => void;
}

export interface AppbarMoreProps {
  children: FC<ChildProps>;
  iconProps?: IconProps;
}

export function AppbarMore({ children: Child, iconProps }: AppbarMoreProps) {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const handle = useCallback(
    <T,>(f: (arg: T) => void) =>
      (arg: T) => {
        setVisible(false);
        f(arg);
      },
    [],
  );

  return (
    <Menu
      anchor={<MoreVerticalIcon {...iconProps} onPress={open} />}
      visible={visible}
      onDismiss={close}
    >
      <Child handle={handle} />
    </Menu>
  );
}
