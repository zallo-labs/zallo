import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { Chip, ChipProps, Menu, MenuProps } from 'react-native-paper';

export type SelectFieldProps<T> = Pick<MenuProps, 'style' | 'contentStyle'> & {
  value: T;
  onChange: (value: T) => void;
  entries: readonly (readonly [string, T])[];
  menuProps?: Partial<MenuProps>;
  chipProps?: Partial<Omit<ChipProps, 'children' | 'onPress'>>;
};

export const SelectField = <T,>({
  value,
  onChange,
  entries,
  menuProps,
  chipProps,
}: SelectFieldProps<T>) => {
  const styles = useStyles();

  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  const toggle = () => setVisible((v) => !v);

  const label = entries.find((e) => e[1] === value)![0];

  return (
    <Menu
      visible={visible}
      onDismiss={close}
      anchor={
        <Chip {...chipProps} onPress={toggle}>
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
};

const useStyles = makeStyles(({ colors }) => ({
  selected: {
    color: colors.primary,
  },
}));
