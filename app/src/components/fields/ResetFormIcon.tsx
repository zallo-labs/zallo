import { IconProps, UndoIcon } from '@theme/icons';
import { Control, FieldValues, UseFormReset, useFormState } from 'react-hook-form';

export interface FormResetIconProps<TFieldValues extends FieldValues> extends IconProps {
  control?: Control<TFieldValues>;
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
