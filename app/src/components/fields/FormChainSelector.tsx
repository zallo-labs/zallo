import { FieldPath, FieldValues, UseControllerProps, useController } from 'react-hook-form';
import { ChainSelector, ChainSelectorProps } from './ChainSelector';
import { Chain } from 'chains';

export interface FormSelectChipProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName>,
    Omit<ChainSelectorProps, 'value' | 'onChange'> {}

export function FormChainSelector<
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
    <ChainSelector
      {...fieldProps}
      value={field.value as Chain}
      onChange={(value) => field.onChange(value)}
    />
  );
}
