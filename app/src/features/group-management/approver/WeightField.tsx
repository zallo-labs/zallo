import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { TextField } from '@components/fields/TextField';
import { useNumberInput } from '@components/fields/useNumberInput';

export interface WeightFieldProps {
  weight: number;
  setWeight: (weight: number) => void;
}

export const WeightField = ({ weight, setWeight }: WeightFieldProps) => {
  const { value, onChangeText, ...inputProps } = useNumberInput({
    value: weight,
    onChange: setWeight,
  });

  const [error, setError] = useState<string | undefined>();

  const handleChange = (value: string) => {
    onChangeText(value);

    const parsed = parseFloat(value);
    if (value && parsed <= 0) {
      setError('Min >0');
    } else if (parsed > 100) {
      setError('Max 100');
    } else if (error) {
      setError(undefined);
    }
  };

  return (
    <TextField
      value={value}
      onChangeText={handleChange}
      {...inputProps}
      right={<TextInput.Affix text="%" />}
      dense
      error={error}
      noOutline
      noBackground
    />
  );
};
