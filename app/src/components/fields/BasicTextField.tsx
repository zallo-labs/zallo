import { makeStyles } from '@theme/makeStyles';
import { TextInput, TextInputProps } from 'react-native';

export interface BasicTextFieldProps extends TextInputProps {}

export const BasicTextField = ({ ...props }: BasicTextFieldProps) => {
  const styles = useStyles();

  return (
    <TextInput
      selectionColor={styles.selection.color}
      placeholderTextColor={styles.placeholder.color}
      {...props}
      style={[styles.input, props.style]}
    />
  );
};

const useStyles = makeStyles(({ colors, fonts }) => ({
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
