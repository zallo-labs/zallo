import _ from 'lodash';
import { FieldPath, FieldValues, useController, UseControllerProps } from 'react-hook-form';

import { TextField, TextFieldProps } from './TextField';

export interface FormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName>,
    Omit<TextFieldProps, 'value' | 'onChange' | 'defaultValue'> {}

export function FormTextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  rules = {},
  shouldUnregister,
  defaultValue,
  control,
  onChangeText,
  required = !!rules.required,
  ...fieldProps
}: FormTextFieldProps<TFieldValues, TName>) {
  if (required && !rules.required) rules.required = true;

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, rules, shouldUnregister, defaultValue, control });

  return (
    <TextField
      {...fieldProps}
      value={value ?? ''}
      onChangeText={(value) => {
        onChange(value);
        onChangeText?.(value);
      }}
      onBlur={(e) => {
        onBlur();
        fieldProps.onBlur?.(e);
      }}
      required={required}
      error={error?.message || _.capitalize(error?.type)}
    />
  );
}
