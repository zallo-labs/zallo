import { useMemo, useState } from 'react';
import { TextField, TextFieldProps } from './TextField';

export interface SubmittableTextFieldProps
  extends Omit<TextFieldProps, 'value'> {
  value?: string;
  onSubmit: (value: string) => void;
  hasError?: (value: string) => string | false;
}

export const SubmittableTextField = ({
  value = '',
  onSubmit,
  hasError,
  ...fieldProps
}: SubmittableTextFieldProps) => {
  const [input, setInput] = useState(value);

  const error = useMemo(() => hasError?.(input), [input, hasError]);

  return (
    <TextField
      value={input}
      onChangeText={setInput}
      error={error}
      onSubmitEditing={() => !error && input !== value && onSubmit(input)}
      {...fieldProps}
    />
  );
};
