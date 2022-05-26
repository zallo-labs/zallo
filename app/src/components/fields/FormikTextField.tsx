import { useField, useFormikContext } from 'formik';
import { TextField, TextFieldProps } from './TextField';

export type FormikTextFieldProps = TextFieldProps & {
  name: string;
};

export const FormikTextField = ({ name, ...props }: FormikTextFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const formik = useFormikContext();

  return (
    <TextField
      value={field.value}
      onChangeText={helpers.setValue}
      error={meta.touched && meta.error}
      disabled={formik.isSubmitting}
      onBlur={() => helpers.setTouched(true)}
      {...props}
    />
  );
};
