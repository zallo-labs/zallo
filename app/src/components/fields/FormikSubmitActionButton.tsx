import { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { containsErrors } from './FormikErrors';
import { ActionButton, ActionButtonProps } from '../buttons/ActionButton';

const allTouched = (values: unknown, touched: Record<string, boolean>) =>
  typeof values === 'object' &&
  values !== null &&
  Object.keys(values).every((field) => touched[field]);

export interface FormikSubmitActionButtonProps extends ActionButtonProps {
  disableWhenClean?: boolean;
}

export const FormikSubmitActionButton = ({
  disableWhenClean,
  ...props
}: FormikSubmitActionButtonProps) => {
  const { submitForm, isSubmitting, dirty, errors, touched, initialValues } = useFormikContext();

  const disabled = useMemo(
    () =>
      (disableWhenClean && !dirty) ||
      isSubmitting ||
      (allTouched(initialValues, touched) && containsErrors(errors)),
    [disableWhenClean, dirty, isSubmitting, initialValues, touched, errors],
  );

  return (
    <ActionButton onPress={submitForm} disabled={disabled} loading={isSubmitting} {...props} />
  );
};
