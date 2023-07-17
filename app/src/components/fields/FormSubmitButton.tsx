import { FieldValues, useFormState, UseFormStateProps } from 'react-hook-form';
import { Button, ButtonProps } from '~/components/Button';

export interface FormSubmitDisabledOptions<TFieldValues extends FieldValues> {
  control?: UseFormStateProps<TFieldValues>['control'];
  requireChanges?: boolean;
}

export function useFormSubmitDisabled<TFieldValues extends FieldValues>({
  control,
  requireChanges,
}: FormSubmitDisabledOptions<TFieldValues>) {
  const { isValid, isSubmitting, isSubmitted, isDirty } = useFormState({ control });

  return isSubmitting || (isSubmitted && !isValid) || (requireChanges && !isDirty);
}

export interface FormSubmitButtonProps<TFieldValues extends FieldValues>
  extends ButtonProps,
    FormSubmitDisabledOptions<TFieldValues> {}

export function FormSubmitButton<TFieldValues extends FieldValues>({
  requireChanges,
  control,
  disabled,
  ...props
}: FormSubmitButtonProps<TFieldValues>) {
  return (
    <Button {...props} disabled={useFormSubmitDisabled({ control, requireChanges }) || disabled} />
  );
}
