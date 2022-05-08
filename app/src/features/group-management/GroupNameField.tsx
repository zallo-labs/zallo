import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useDebounce } from 'use-debounce';
import { Box } from '@components/Box';
import { Group } from '@queries';
import { useUpdateSafe } from '@gql/mutations/useUpdateSafe';

export interface GroupNameFieldProps {
  group: Group;
}

export const GroupNameField = ({ group }: GroupNameFieldProps) => {
  const updateSafe = useUpdateSafe();

  const [name, setName] = useState<string | undefined>(group.name);
  const [debouncedName] = useDebounce(name, 500);

  useEffect(() => {
    if (debouncedName !== group.name) {
      updateSafe({
        groups: {
          update: [
            {
              where: { id: group.id },
              data: {
                name: {
                  set: debouncedName || null,
                },
              },
            },
          ],
        },
      });
    }
  }, [debouncedName]);

  return (
    <Box>
      <TextInput
        placeholder="Group name..."
        value={name}
        onChangeText={setName}
        autoComplete={false}
        underlineColor="transparent"
        style={{ textAlign: 'center' }}
      />
    </Box>
  );
};
