import { Box } from '@components/Box';
import { TextInput, TextInputProps } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface BasicTextFieldProps extends TextInputProps {}

export const BasicTextField = ({ ...props }: BasicTextFieldProps) => {
  const { colors } = useTheme();

  return (
    <Box>
      <TextInput
        selectionColor={colors.primary}
        placeholderTextColor={colors.placeholder}
        {...props}
        style={[
          {
            fontSize: 16,
            color: colors.onBackground,
          },
          props.style,
        ]}
      />
    </Box>
  );
};
