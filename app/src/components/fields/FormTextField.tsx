import { TextField, TextFieldProps } from './TextField';
import { UseControllerProps, useController, FieldValues, FieldPath } from 'react-hook-form';
import _ from 'lodash';

export interface FormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName>,
    Omit<TextFieldProps, 'value' | 'onChangeText' | 'onChange' | 'defaultValue'> {}

export const FormTextField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  ...fieldProps
}: FormTextFieldProps<TFieldValues, TName>) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error, isDirty, isTouched },
  } = useController({ name, rules, shouldUnregister, defaultValue, control });

  return (
    <TextField
      {...fieldProps}
      value={value}
      onChangeText={(value) => onChange(value)}
      onBlur={onBlur}
      error={error?.message || _.capitalize(error?.type)}
      {...(rules?.required && { required: true })}
    />
  );
};
