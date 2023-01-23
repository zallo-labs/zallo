import { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { containsErrors } from './FormikErrors';
import { Fab, FabProps } from '~/components/buttons/Fab';

const allTouched = (values: unknown, touched: Record<string, boolean>) =>
  typeof values === 'object' &&
  values !== null &&
  Object.keys(values).every((field) => touched[field]);

export type FormikSubmitFabProps = FabProps & {
  hideWhenClean?: boolean;
};

export const FormikSubmitFab = ({ hideWhenClean, ...props }: FormikSubmitFabProps) => {
  const { submitForm, isSubmitting, dirty, errors, touched, initialValues } = useFormikContext();

  const disabled = useMemo(
    () => isSubmitting || (allTouched(initialValues, touched) && containsErrors(errors)),
    [isSubmitting, initialValues, touched, errors],
  );

  if (hideWhenClean && !dirty) return null;

  return <Fab onPress={submitForm} disabled={disabled} loading={isSubmitting} {...props} />;
};
