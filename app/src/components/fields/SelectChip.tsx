import { createStyles, useStyles } from '@theme/styles';
import { useState } from 'react';
import { Chip, ChipProps, Menu, MenuProps } from 'react-native-paper';

export interface SelectChipProps<T> {
  value: T;
  onChange: (value: T) => void;
  entries: readonly (readonly [string, T])[];
  menuProps?: Partial<MenuProps>;
  chipProps?: Partial<Omit<ChipProps, 'children' | 'onPress'>>;
  equals?: (a: T, b: T) => boolean;
}

export function SelectChip<T>({
  value,
  onChange,
  entries,
  menuProps,
  chipProps,
  equals = (a, b) => a === b,
}: SelectChipProps<T>) {
  const { styles } = useStyles(stylesheet);

  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  const toggle = () => setVisible((v) => !v);

  const label = entries.find((e) => equals(e[1], value))![0];

  return (
    <Menu
      visible={visible}
      onDismiss={close}
      anchor={
        <Chip {...(chipProps?.closeIcon && { onClose: () => {} })} {...chipProps} onPress={toggle}>
          {label}
        </Chip>
      }
      {...menuProps}
    >
      {entries.map(([title, value]) => (
        <Menu.Item
          key={title}
          title={title}
          onPress={() => {
            onChange(value);
            close();
          }}
          titleStyle={title === label ? styles.selected : undefined}
        />
      ))}
    </Menu>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  selected: {
    color: colors.primary,
  },
}));
