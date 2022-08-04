import { TextField } from '@components/fields/TextField';
import { CheckIcon } from '@util/theme/icons';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';

export interface AccountNameInputProps {
  value: string;
  onSave: (value: string) => void;
}

export const AccountNameInput = ({ value, onSave }: AccountNameInputProps) => {
  const [input, setInput] = useState(value);

  const error = input.length === 0 && 'Required';

  return (
    <TextField
      label="Name"
      value={input}
      onChangeText={setInput}
      error={error}
      {...(input !== value &&
        !error && {
          right: (
            <TextInput.Icon name={CheckIcon} onPress={() => onSave(input)} />
          ),
        })}
    />
  );
};
