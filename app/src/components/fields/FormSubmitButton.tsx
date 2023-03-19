import { FieldValues, useFormState, UseFormStateProps } from 'react-hook-form';
import { Button, ButtonProps } from 'react-native-paper';

export interface FormSubmitButtonProps<TFieldValues extends FieldValues>
  extends Pick<UseFormStateProps<TFieldValues>, 'control'>,
    ButtonProps {}

export const FormSubmitButton = <TFieldValues extends FieldValues = FieldValues>({
  control,
  disabled,
  ...props
}: FormSubmitButtonProps<TFieldValues>) => {
  const { isValid, isSubmitting, isSubmitted } = useFormState({ control });

  return <Button {...props} disabled={disabled || (isSubmitted && !isValid) || isSubmitting} />;
};
