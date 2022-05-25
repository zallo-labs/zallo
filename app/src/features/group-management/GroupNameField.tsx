import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { CombinedGroup } from '@queries';
import { useUpsertGroup } from '@gql/mutations/useUpsertGroup';
import { TextField } from '@components/fields/TextField';

export interface GroupNameFieldProps {
  group: CombinedGroup;
}

export const GroupNameField = ({ group }: GroupNameFieldProps) => {
  const upsertGroup = useUpsertGroup();

  const [name, setName] = useState<string | undefined>(group.name);
  const [debouncedName] = useDebounce(name, 500);

  useEffect(() => {
    if (debouncedName !== group.name)
      upsertGroup({ ...group, name: debouncedName }, group);
  }, [debouncedName]);

  return (
    <TextField
      placeholder="Group name..."
      value={name}
      onChangeText={setName}
      style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 24 }}
      noOutline
      wrap
    />
  );
};
