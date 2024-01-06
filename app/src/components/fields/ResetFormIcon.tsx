import { Control, FieldValues, UseFormReset, useFormState } from 'react-hook-form';

import { IconProps, UndoIcon } from '~/util/theme/icons';

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
