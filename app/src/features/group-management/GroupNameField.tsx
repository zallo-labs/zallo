import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { TextField } from '@components/fields/TextField';
import { useUpsertApiGroup } from '~/mutations/group/useUpsertGroup.api';
import { CombinedGroup } from '~/queries/safe';

export interface GroupNameFieldProps {
  group: CombinedGroup;
}

export const GroupNameField = ({ group }: GroupNameFieldProps) => {
  const upsertGroup = useUpsertApiGroup();

  const [name, setName] = useState(group.name);
  const [debouncedName] = useDebounce(name, 500);

  useEffect(() => {
    if (debouncedName !== group.name)
      upsertGroup({ ...group, name: debouncedName });
  }, [debouncedName, group, upsertGroup]);

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
