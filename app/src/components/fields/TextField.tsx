import { ComponentPropsWithoutRef } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { HelperText, TextInput } from 'react-native-paper';
import { Box } from '~/components/layout/Box';

type TextInputProps = ComponentPropsWithoutRef<typeof TextInput>;

export type TextFieldProps = Omit<TextInputProps, 'error' | 'style'> & {
  supporting?: string;
  error?: string | false;
  required?: boolean;
  wrap?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const TextField = ({
  supporting,
  error,
  required,
  wrap,
  containerStyle,
  textStyle,
  ...props
}: TextFieldProps) => {
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
        {...(props.label && required && { label: `${props.label}*` })}
      />

      <Collapsible collapsed={!(error || supporting)}>
        <HelperText type={error ? 'error' : 'info'}>{error || supporting}</HelperText>
      </Collapsible>
    </Box>
  );
};
