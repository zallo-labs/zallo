import { ComponentPropsWithoutRef, useMemo } from 'react';
import Collapsible from 'react-native-collapsible';
import { HelperText, TextInput } from 'react-native-paper';
import { Box } from '~/components/layout/Box';

type TextInputProps = ComponentPropsWithoutRef<typeof TextInput>;

export type TextFieldProps = Omit<TextInputProps, 'error'> & {
  error?: string | false | ((value: TextInputProps['value']) => string | false);
  wrap?: boolean;
};

export const TextField = ({
  error: errorProp,
  wrap,
  ...props
}: TextFieldProps) => {
  const error = useMemo(
    () =>
      typeof errorProp === 'function' ? errorProp(props.value) : errorProp,
    [errorProp, props.value],
  );

  return (
    <Box>
      <TextInput
        mode="outlined"
        // Control
        error={!!error}
        multiline={props.multiline ?? wrap}
        blurOnSubmit={props.blurOnSubmit ?? wrap}
        // Other
        autoCorrect={false}
        {...props}
      />

      <Collapsible collapsed={!error}>
        <HelperText type="error">{error}</HelperText>
      </Collapsible>
    </Box>
  );
};
