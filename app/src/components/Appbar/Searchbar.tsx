import { IconProps, SearchIcon } from '@theme/icons';
import { toArray } from 'lib';
import { FC } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { BasicTextField, BasicTextFieldProps } from '../fields/BasicTextField';
import { createStyles, useStyles } from '@theme/styles';

export interface SearchbarProps extends BasicTextFieldProps {
  leading?: FC<IconProps & { style?: StyleProp<ViewStyle> }>;
  trailing?: FC<IconProps> | FC<IconProps>[];
  placeholder?: string;
  inset?: boolean;
}

export function Searchbar({
  leading: Leading = SearchIcon,
  trailing,
  inset = true,
  ...inputProps
}: SearchbarProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <Surface elevation={0} style={styles.container(inset)}>
      <View style={styles.leadingContainer}>
        {Leading && <Leading size={styles.leadingIcon.fontSize} color={styles.leadingIcon.color} />}
      </View>

      <BasicTextField {...inputProps} style={[styles.input, inputProps.style]} />

      <View style={styles.trailingContainer}>
        {toArray(trailing ?? []).map((Trailing, i) => (
          <Trailing key={i} size={styles.trailingIcon.fontSize} color={styles.trailingIcon.color} />
        ))}
      </View>
    </Surface>
  );
}

const stylesheet = createStyles(({ colors, corner, fonts }, { insets }) => ({
  // https://m3.material.io/components/search/specs
  container: (inset?: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    // minWidth: 360, // In the m3 spec, but breaks on smaller screens
    maxWidth: 720,
    borderRadius: corner.full,
    paddingHorizontal: 16,
    marginTop: 8 + (inset ? insets.top : 0),
    marginBottom: 8,
    backgroundColor: colors.surfaceContainer.high,
  }),
  leadingContainer: {
    paddingRight: 16,
  },
  leadingIcon: {
    fontSize: 24,
    color: colors.onSurface,
  },
  input: {
    flex: 1,
    ...fonts.bodyLarge,
  },
  inputPlaceholder: {
    color: colors.onSurfaceVariant,
  },
  trailingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trailingIcon: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
  },
}));
