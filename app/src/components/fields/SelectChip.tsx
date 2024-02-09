import { DownArrowIcon, IconProps } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { FC, useState } from 'react';
import { Chip, ChipProps, Menu, MenuProps } from 'react-native-paper';

export interface SelectEntry<T> {
  title: string;
  value: T;
  icon?: FC<IconProps & { value: T }>;
}

export interface SelectChipProps<T> {
  value: T;
  onChange: (value: T) => void;
  entries: readonly SelectEntry<T>[];
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

  const entry = entries.find((e) => equals(e.value, value));
  const EntryIcon = entry?.icon;

  return (
    <Menu
      visible={visible}
      onDismiss={close}
      anchor={
        <Chip
          icon={EntryIcon && ((props) => <EntryIcon {...props} value={value} />)}
          closeIcon={DownArrowIcon}
          onClose={() => {}}
          {...chipProps}
          onPress={toggle}
          style={[styles.chip, chipProps?.style]}
          textStyle={[styles.chipText, chipProps?.textStyle]}
        >
          {entry?.title ?? 'Select...'}
        </Chip>
      }
      {...menuProps}
    >
      {entries.map(({ title, value, icon: Icon }) => (
        <Menu.Item
          key={title}
          title={title}
          onPress={() => {
            onChange(value);
            close();
          }}
          titleStyle={title === entry?.title ? styles.selected : undefined}
          leadingIcon={Icon && ((props) => <Icon {...props} value={value} />)}
        />
      ))}
    </Menu>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  chip: {
    backgroundColor: colors.secondaryContainer,
  },
  chipText: {
    color: colors.onSecondaryContainer,
  },
  selected: {
    color: colors.primary,
  },
}));
