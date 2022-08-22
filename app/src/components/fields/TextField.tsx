import { ComponentPropsWithoutRef } from 'react';
import { HelperText, TextInput } from 'react-native-paper';
import { Box } from '@components/Box';

type TextInputProps = ComponentPropsWithoutRef<typeof TextInput>;

export type TextFieldProps = Omit<TextInputProps, 'error'> & {
  error?: string | false;
  wrap?: boolean;
  noOutline?: boolean;
  noBackground?: boolean;
};

export const TextField = ({
  error,
  wrap,
  noOutline,
  noBackground,
  ...props
}: TextFieldProps) => {
  const outlineColor = noOutline ? 'transparent' : undefined;

  return (
    <Box>
      <Box>
        <TextInput
          mode="outlined"
          // Control
          error={!!error}
          multiline={props.multiline ?? wrap}
          blurOnSubmit={props.blurOnSubmit ?? wrap}
          // Outline
          outlineColor={outlineColor}
          underlineColor={outlineColor}
          // Other
          autoCorrect={false}
          {...props}
          style={[
            {
              ...(noBackground && { backgroundColor: 'transparent' }),
            },
            props.style,
          ]}
        />
      </Box>

      {error && (
        <Box>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </Box>
      )}
    </Box>
  );
};
