import { CheckIcon } from '@util/theme/icons';
import { useMemo, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { TextField } from './TextField';

export interface SubmittableTextFieldProps {
  value: string;
  onSubmit: (value: string) => void;
  hasError?: (value: string) => string | false;
}

export const SubmittableTextField = ({
  value,
  onSubmit,
  hasError,
}: SubmittableTextFieldProps) => {
  const [input, setInput] = useState(value);

  const error = useMemo(() => hasError?.(input), [input, hasError]);

  return (
    <TextField
      label="Name"
      value={input}
      onChangeText={setInput}
      error={error}
      {...(input !== value &&
        !error && {
          right: (
            <TextInput.Icon name={CheckIcon} onPress={() => onSubmit(input)} />
          ),
        })}
    />
  );
};
