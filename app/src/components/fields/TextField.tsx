import { ComponentPropsWithoutRef, useMemo } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { HelperText, TextInput } from 'react-native-paper';
import { Box } from '~/components/layout/Box';

type TextInputProps = ComponentPropsWithoutRef<typeof TextInput>;

export type TextFieldProps = Omit<TextInputProps, 'error' | 'style'> & {
  error?: string | false | ((value: TextInputProps['value']) => string | false);
  wrap?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const TextField = ({
  error: errorProp,
  wrap,
  containerStyle,
  textStyle,
  ...props
}: TextFieldProps) => {
  const error = useMemo(
    () =>
      typeof errorProp === 'function' ? errorProp(props.value) : errorProp,
    [errorProp, props.value],
  );

  return (
    <Box style={containerStyle}>
      <TextInput
        mode="outlined"
        // Control
        error={!!error}
        multiline={props.multiline ?? wrap}
        blurOnSubmit={props.blurOnSubmit ?? wrap}
        // Other
        autoCorrect={false}
        style={textStyle}
        {...props}
      />

      <Collapsible collapsed={!error}>
        <HelperText type="error">{error}</HelperText>
      </Collapsible>
    </Box>
  );
};
