import { ZERO_ADDR, isAddressLike } from 'lib';
import { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

export type Rules<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName>['rules'];

export const ADDRESS_FIELD_RULES = {
  minLength: {
    value: ZERO_ADDR.length,
    message: `Must be ${ZERO_ADDR.length} characters`,
  },
  pattern: {
    value: /^0x/,
    message: 'Must start with 0x',
  },
  maxLength: {
    value: ZERO_ADDR.length,
    message: `Must be ${ZERO_ADDR.length} characters`,
  },
  validate: (v) => isAddressLike(v) || 'Must be a valid address',
} satisfies Rules;
