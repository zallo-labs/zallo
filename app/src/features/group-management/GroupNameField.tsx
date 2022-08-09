import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { TextField } from '@components/fields/TextField';
import { useUpsertApiWallet } from '~/mutations/wallet/useUpsertWallet.api';
import { CombinedWallet } from '~/queries/wallets';

export interface GroupNameFieldProps {
  group: CombinedWallet;
}

export const GroupNameField = ({ group }: GroupNameFieldProps) => {
  const upsertGroup = useUpsertApiWallet();

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
