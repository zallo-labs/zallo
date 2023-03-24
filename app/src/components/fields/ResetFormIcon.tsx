import { IconProps, UndoIcon } from '@theme/icons';
import { FieldValues, UseFormReset, useFormState, UseFormStateProps } from 'react-hook-form';

export interface FormResetIconProps<TFieldValues extends FieldValues> extends IconProps {
  control?: UseFormStateProps<TFieldValues>['control'];
  reset: UseFormReset<TFieldValues>;
}

export const FormResetIcon = <TFieldValues extends FieldValues>({
  control,
  reset,
  ...iconProps
}: FormResetIconProps<TFieldValues>) => {
  const { isDirty } = useFormState({ control });

  if (!isDirty) return null;

  return <UndoIcon {...iconProps} onPress={() => reset()} />;
};
