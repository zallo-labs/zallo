import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardType } from 'react-native';

const JS_NUMBER_MAX_DECIMALS = 16;

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

export interface UseNumberInputOptions {
  value?: number;
  onChange: (value: number) => void;
  maxDecimals?: number;
}

export const useNumberInput = ({
  value,
  onChange,
  maxDecimals = JS_NUMBER_MAX_DECIMALS,
}: UseNumberInputOptions) => {
  const [input, setInput] = useState(toStr(value));

  const isValidInput = useMemo(() => {
    const validPattern = new RegExp(
      `^(?:\\d,?)*(?:\\.\\d{0,${maxDecimals}})?$`,
    );
    return (input: string) => !!input.match(validPattern);
  }, [maxDecimals]);

  const handleStrChange = useCallback(
    (value: string) => {
      if (!isValidInput(value)) return;

      setInput(value);

      const normalised = normalise(value);
      onChange(parseFloat(normalised));
    },
    [isValidInput, onChange],
  );

  // Update str if value changes externally; detect these changes by checking for equivalence
  useEffect(() => {
    const valueStr = toStr(value);
    if (value !== undefined && normalise(input) !== normalise(valueStr))
      setInput(valueStr);
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
