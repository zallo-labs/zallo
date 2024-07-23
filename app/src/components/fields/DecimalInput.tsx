import Decimal from 'decimal.js';
import { ComponentType, Dispatch, SetStateAction, useState } from 'react';
import { TextInput as NativeTextInput, TextInputProps } from 'react-native';
import { z } from 'zod';

const decimal = z
  .string()
  .regex(/^\d*(\.\d*)?$/)
  .transform((v, ctx) => {
    try {
      if (v === '') return new Decimal(0);
      return new Decimal(v);
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Must be a valid decimal' });
      return z.NEVER;
    }
  });

export interface DecimalInputProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value: Decimal;
  onChange: Dispatch<SetStateAction<Decimal>>;
  as?: ComponentType<TextInputProps>;
}

export function DecimalInput({
  as: TextInput = NativeTextInput,
  value,
  onChange,
  ...props
}: DecimalInputProps) {
  const [input, setInput] = useState(() => value.isZero() ? '' : value.toString());

  const handleChangeText = (input: string) => {
    setInput(input);

    const parsed = decimal.safeParse(input);
    if (parsed.data) {
      onChange(parsed.data);
    } else {
      // If the input is not a valid decimal, don't update the value
    }
  };

  return (
    <TextInput keyboardType="numeric" onChangeText={handleChangeText} {...props} value={input} />
  );
}
