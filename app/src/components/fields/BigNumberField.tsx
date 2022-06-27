import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { BasicTextField, BasicTextFieldProps } from './BasicTextField';

const toStr = (v: BigNumber | undefined, decimal: number) =>
  v ? formatUnits(v, decimal) : '';

const TRAILING_COMMAS_PATTERN = /\.+$/;
const normalise = (s?: string | undefined) => {
  // Remove all commas, replaceAll isn't supported by RN Android
  s = s.split(',').join('');

  // Remove trailing decimal separators (e.g. '.')
  s = s.replace(TRAILING_COMMAS_PATTERN, '');

  // Remove trailing .0
  if (s.endsWith('.0')) s = s.slice(0, -2);

  // Treat empty | undefined equivalent to zero
  if (!s) s = '0';

  return s;
};

const VALID_INPUT_PATTERN = /^(?:\d,?)*(?:\.\d*)?$/;
const isValidInput = (input: string) => !!input.match(VALID_INPUT_PATTERN);

export interface BigNumberFieldProps
  extends Omit<BasicTextFieldProps, 'value' | 'onChange'> {
  value?: BigNumber;
  onChange: (value: BigNumber) => void;
  decimals?: number;
}

export const BigNumberField = ({
  value,
  onChange,
  decimals = 0,
  ...props
}: BigNumberFieldProps) => {
  const [input, setInput] = useState(toStr(value, decimals));

  console.log(value?.toString());

  const handleStrChange = useCallback(
    (value: string) => {
      if (!isValidInput(value)) return;

      setInput(value);

      try {
        const normalised = normalise(value);
        onChange(parseUnits(normalised, decimals));
      } catch (e) {
        console.log({ e });
      }
    },
    [decimals, onChange],
  );

  // Update str if value changes externally; detect these changes by checking for equivalence
  useEffect(() => {
    if (value && normalise(input) !== normalise(toStr(value, decimals)))
      setInput(toStr(value, decimals));
  }, [decimals, input, value]);

  return (
    <BasicTextField
      value={input}
      onChangeText={handleStrChange}
      placeholder="0"
      keyboardType="numeric"
      {...props}
    />
  );
};
