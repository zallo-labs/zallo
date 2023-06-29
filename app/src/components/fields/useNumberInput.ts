import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardType } from 'react-native';

const JS_NUMBER_MAX_DECIMALS = 16;

const toStr = (value?: number) => value?.toString() ?? '';

const toNumber = (s?: string) => {
  // Remove all commas, replaceAll isn't supported by RN Android
  s = s?.split(',').join('');

  // Treat empty | undefined equivalent to zero
  if (!s) s = '0';

  if (s.startsWith('.')) s = `0${s}`;

  return parseFloat(s);
};

export interface UseNumberInputOptions {
  value?: number;
  onChange: (value: number | undefined) => void;
  maxDecimals?: number;
}

export const useNumberInput = ({
  value,
  onChange,
  maxDecimals = JS_NUMBER_MAX_DECIMALS,
}: UseNumberInputOptions) => {
  const [input, setInput] = useState(() => toStr(value));

  const pattern = useMemo(
    () => new RegExp(`^(?:\\d,?)*(?:\\.\\d{0,${maxDecimals}})?$`),
    [maxDecimals],
  );

  const onChangeInput = useCallback(
    (newInput: string) => {
      if (pattern.test(newInput)) {
        setInput(newInput);
        onChange(newInput !== '' ? toNumber(newInput) : undefined);
      }
    },
    [pattern, onChange],
  );

  // Update str if value changes externally; detect these changes by checking for equivalence
  useEffect(() => {
    if (value !== undefined && toNumber(input) !== value) setInput(toStr(value));
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
