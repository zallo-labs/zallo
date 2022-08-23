import { useTheme } from '@theme/paper';
import { TextInput, TextInputProps } from 'react-native';

export interface BasicTextFieldProps extends TextInputProps {}

export const BasicTextField = ({ ...props }: BasicTextFieldProps) => {
  const { colors } = useTheme();

  return (
    <TextInput
      selectionColor={colors.primary}
      placeholderTextColor={colors.onSurfaceDisabled}
      {...props}
      style={[{ color: colors.onSurface }, props.style]}
    />
  );
};
