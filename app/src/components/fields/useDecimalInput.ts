import Decimal from 'decimal.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardType } from 'react-native';

const toStr = (value?: Decimal) => value?.toString() ?? '';

const toDecimal = (s?: string): Decimal => {
  // Remove all commas, replaceAll isn't supported by RN Android
  s = s?.split(',').join('');

  // Treat empty | undefined equivalent to zero
  if (!s) s = '0';

  if (s.startsWith('.')) s = `0${s}`;

  return new Decimal(s);
};

export interface UseDecimalInputOptions {
  value?: Decimal;
  onChange: (value: Decimal | undefined) => void;
  maxDecimals?: number;
}

export const useDecimalInput = ({ value, onChange, maxDecimals = 30 }: UseDecimalInputOptions) => {
  const [input, setInput] = useState(() => toStr(value));

  const pattern = useMemo(
    () => new RegExp(`^(?:\\d,?)*(?:\\.\\d{0,${maxDecimals}})?$`),
    [maxDecimals],
  );

  const onChangeInput = useCallback(
    (newInput: string) => {
      if (pattern.test(newInput)) {
        setInput(newInput);
        onChange(newInput !== '' ? toDecimal(newInput) : undefined);
      }
    },
    [pattern, onChange],
  );

  // Update str if value changes externally; detect these changes by checking for equivalence
  useEffect(() => {
    if (value !== undefined && toDecimal(input) !== value) setInput(toStr(value));
  }, [input, value]);

  return useMemo(
    () => ({
      value: input,
      onChangeText: onChangeInput,
      placeholder: '0',
      keyboardType: 'numeric' as KeyboardType,
    }),
    [onChangeInput, input],
  );
};
