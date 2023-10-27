import { useState } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { TextInput } from 'react-native-paper';
import { FormTextField, FormTextFieldProps } from '~/components/fields/FormTextField';

export function FormPasswordField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: FormTextFieldProps<TFieldValues, TName>) {
  const [secure, setSecure] = useState(true);

  return (
    <FormTextField
      {...props}
      secureTextEntry={secure}
      right={
        <TextInput.Icon
          icon={secure ? 'eye' : 'eye-off'}
          onPress={() => setSecure((secure) => !secure)}
        />
      }
    />
  );
}
