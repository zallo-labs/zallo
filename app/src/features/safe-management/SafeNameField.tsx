import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useSafe } from '@features/safe/SafeProvider';
import { Box } from '@components/Box';
import { useUpsertSafe } from '@gql/mutations/useUpsertSafe';
import { TextField } from '@components/fields/TextField';

export const SafeNameField = () => {
  const { name: savedName } = useSafe();
  const updateSafe = useUpsertSafe();

  const [name, setName] = useState<string | undefined>(savedName);
  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (debouncedName !== savedName)
      updateSafe({ name: debouncedName || null });
  }, [debouncedName]);

  return (
    <Box>
      <TextField
        placeholder="Safe name..."
        value={name}
        onChangeText={setName}
        wrap
        noBackground
        noOutline
        style={{
          textAlign: 'center',
          textAlignVertical: 'center',
          fontSize: 24,
        }}
      />
    </Box>
  );
};
