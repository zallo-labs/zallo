import { FormikErrors as Errors, useFormikContext } from 'formik';
import { Title, useTheme } from 'react-native-paper';

export const containsErrors = (errors: Errors<unknown>) =>
  !errors || Object.keys(errors).length > 0;

const stringify = (errors: Errors<unknown>): string => {
  if (typeof errors === 'string') return errors;

  return Object.values(errors).map(stringify).join('\n');
};

export const FormikErrors = () => {
  const { colors } = useTheme();
  const { errors } = useFormikContext();

  const formatted = stringify(errors);
  if (!formatted) return null;

  return (
    <Title style={{ color: colors.error, textAlign: 'center' }}>
      {formatted}
    </Title>
  );
};
