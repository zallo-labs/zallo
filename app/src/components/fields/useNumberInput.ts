import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardType } from 'react-native';

const toStr = (value?: number) => value?.toString() ?? '';

const normalise = (s?: string) => {
  // Remove all commas, replaceAll isn't supported by RN Android
  s = s?.split(',').join('');

  // Remove trailing zeros after the decimal
  s = s?.replace(/(\.\d*?)0+$/, '$1');

  // Remove trailing decimal separators (e.g. '.')
  s = s?.replace(/\.+$/, '');

  // Treat empty | undefined equivalent to zero
  if (!s) s = '0';

  return s;
};

const VALID_INPUT_PATTERN = /^(?:\d,?)*(?:\.\d*)?$/;
const isValidInput = (input: string) => !!input.match(VALID_INPUT_PATTERN);

export interface UseNumberInputOptions {
  value?: number;
  onChange: (value: number) => void;
}

export const useNumberInput = ({ value, onChange }: UseNumberInputOptions) => {
  const [input, setInput] = useState(toStr(value));

  const handleStrChange = useCallback(
    (value: string) => {
      if (!isValidInput(value)) return;

      setInput(value);

      const normalised = normalise(value);
      onChange(parseFloat(normalised));
    },
    [onChange],
  );

  // Update str if value changes externally; detect these changes by checking for equivalence
  useEffect(() => {
    if (value && normalise(input) !== normalise(toStr(value)))
      setInput(toStr(value));
  }, [input, value]);

  return useMemo(
    () => ({
      value: input,
      onChangeText: handleStrChange,
      placeholder: '0',
      keyboardType: 'numeric' as KeyboardType,
    }),
    [handleStrChange, input],
  );
};
