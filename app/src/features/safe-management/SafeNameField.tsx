import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useDebounce } from 'use-debounce';

import { useSafe } from '@features/safe/SafeProvider';
import { Box } from '@components/Box';
import { useUpdateSafe } from '@gql/mutations/useUpdateSafe';

export const SafeNameField = () => {
  const { name: savedName } = useSafe();
  const updateSafe = useUpdateSafe();

  const [name, setName] = useState<string | undefined>(savedName);
  const [debouncedName] = useDebounce(name, 500);

  useEffect(() => {
    if (debouncedName !== savedName) {
      updateSafe({
        name: {
          set: debouncedName || null,
        },
      });
    }
  }, [debouncedName]);

  return (
    <Box>
      <TextInput
        placeholder="Safe name..."
        value={name}
        onChangeText={setName}
        underlineColor="transparent"
        style={{ textAlign: 'center' }}
      />
    </Box>
  );
};
