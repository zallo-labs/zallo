import { TextInput, TextInputProps } from 'react-native';

import { createStyles, useStyles } from '~/util/theme/styles';

export interface BasicTextFieldProps extends TextInputProps {}

export const BasicTextField = ({ ...props }: BasicTextFieldProps) => {
  const { styles } = useStyles(stylesheet);

  return (
    <TextInput
      selectionColor={styles.selection.color}
      placeholderTextColor={styles.placeholder.color}
      {...props}
      style={[styles.input, props.style]}
    />
  );
};

const stylesheet = createStyles(({ colors, fonts }) => ({
  input: {
    color: colors.onSurface,
    ...fonts.bodyLarge,
  },
  selection: {
    color: colors.primary,
  },
  placeholder: {
    color: colors.onSurfaceVariant,
  },
}));
