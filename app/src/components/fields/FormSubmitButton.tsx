import { FieldValues, useFormState, UseFormStateProps } from 'react-hook-form';
import { Button, ButtonProps } from '~/components/Button';

export interface FormSubmitButtonProps<TFieldValues extends FieldValues> extends ButtonProps {
  control?: UseFormStateProps<TFieldValues>['control'];
  requireChanges?: boolean;
}

export const FormSubmitButton = <TFieldValues extends FieldValues>({
  requireChanges,
  control,
  disabled,
  ...props
}: FormSubmitButtonProps<TFieldValues>) => {
  const { isValid, isSubmitting, isSubmitted, isDirty } = useFormState({ control });

  return (
    <Button
      {...props}
      disabled={
        disabled || isSubmitting || (isSubmitted && !isValid) || (requireChanges && !isDirty)
      }
    />
  );
};
