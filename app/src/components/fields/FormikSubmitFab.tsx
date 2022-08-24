import { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { containsErrors } from './FormikErrors';
import { FAB, FABProps } from '~/components/FAB';

const allTouched = (values: unknown, touched: Record<string, boolean>) =>
  typeof values === 'object' &&
  values !== null &&
  Object.keys(values).every((field) => touched[field]);

export type FormikSubmitFabProps = FABProps & {
  hideWhenClean?: boolean;
};

export const FormikSubmitFab = ({
  hideWhenClean,
  ...props
}: FormikSubmitFabProps) => {
  const { submitForm, isSubmitting, dirty, errors, touched, initialValues } =
    useFormikContext();

  const disabled = useMemo(
    () =>
      isSubmitting ||
      (allTouched(initialValues, touched) && containsErrors(errors)),
    [isSubmitting, initialValues, touched, errors],
  );

  if (hideWhenClean && !dirty) return null;

  return (
    <FAB
      onPress={submitForm}
      disabled={disabled}
      loading={isSubmitting}
      {...props}
    />
  );
};
