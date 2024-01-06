import { ComponentPropsWithoutRef } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import Collapsible, { CollapsibleProps } from 'react-native-collapsible';
import { HelperText, TextInput } from 'react-native-paper';

import { createStyles, useStyles } from '~/util/theme/styles';

type TextInputProps = ComponentPropsWithoutRef<typeof TextInput>;

export type TextFieldProps = Omit<TextInputProps, 'error' | 'style'> & {
  supporting?: string;
  supportingStyle?: StyleProp<TextStyle>;
  error?: string | false;
  required?: boolean;
  wrap?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  collapsible?: Partial<CollapsibleProps>;
};

export function TextField({
  supporting,
  supportingStyle,
  error,
  required,
  wrap,
  containerStyle,
  textStyle,
  collapsible,
  ...props
}: TextFieldProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={containerStyle}>
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

      <Collapsible collapsed={!(error || supporting)} {...collapsible}>
        <HelperText
          type={error ? 'error' : 'info'}
          style={[supportingStyle, error && styles.errorText].filter(Boolean) as any}
        >
          {error || supporting}
        </HelperText>
      </Collapsible>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  errorText: {
    color: colors.error,
  },
}));
