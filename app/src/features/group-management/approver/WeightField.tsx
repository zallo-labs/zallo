import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { TextField } from '@components/fields/TextField';

export interface WeightFieldProps {
  weight: number;
  setWeight: (weight: number) => void;
}

export const WeightField = ({ weight, setWeight }: WeightFieldProps) => {
  const [error, setError] = useState<string | undefined>();

  const handleChange = (value: string) => {
    const r = parseFloat(value.replace(',', ''));

    if (isNaN(r)) {
      setWeight(0);
    } else if (r < 0) {
      setError('Min 0%');
    } else if (r > 100) {
      setError('Max 100%');
    } else {
      if (error) setError(undefined);
      setWeight(r);
    }
  };

  return (
    <TextField
      keyboardType="decimal-pad"
      autoComplete="off"
      placeholder="0"
      right={<TextInput.Affix text="%" />}
      dense
      value={`${weight}`}
      onChangeText={handleChange}
      error={error}
      noOutline
      noBackground
    />
  );
};
