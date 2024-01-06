import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';

import { SelectChip, SelectChipProps } from '~/components/fields/SelectChip';

export interface FormSelectChipProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName>,
    Omit<SelectChipProps<FieldPathValue<TFieldValues, TName>>, 'value' | 'onChange'> {}

export function FormSelectChip<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  rules = {},
  shouldUnregister,
  defaultValue,
  control,
  ...fieldProps
}: FormSelectChipProps<TFieldValues, TName>) {
  const { field } = useController({ name, rules, shouldUnregister, defaultValue, control });

  return (
    <SelectChip {...fieldProps} value={field.value} onChange={(value) => field.onChange(value)} />
  );
}
