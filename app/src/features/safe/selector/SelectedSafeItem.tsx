import { TextField } from '@components/fields/TextField';
import { SECONDARY_ICON_SIZE } from '@components/list/Item';
import { useState } from 'react';
import { IconButton, TextInput, useTheme } from 'react-native-paper';
import { useUpsertSafe } from '~/mutations/useUpsertSafe';
import { SafeItem, SafeItemProps } from './SafeItem';

export interface SelectedSafeItemProps extends SafeItemProps {}

export const SelectedSafeItem = ({
  safe,
  ...itemProps
}: SelectedSafeItemProps) => {
  const { colors } = useTheme();
  const upsertSafe = useUpsertSafe();

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(safe.name ?? '');

  const submit = () => {
    if (name !== safe.name) {
      console.log(name);
      upsertSafe({ safe: safe.safe.address, name });
    }
    setEdit(false);
  };

  return (
    <SafeItem
      {...itemProps}
      safe={safe}
      selected
      {...(edit
        ? {
            Main: (
              <TextField
                mode="flat"
                noBackground
                dense
                placeholder="Safe name..."
                value={name}
                onChangeText={setName}
                right={<TextInput.Icon name="check" onPress={submit} />}
              />
            ),
            mainContainer: { marginRight: 2 },
          }
        : {
            Right: (
              <IconButton
                icon="pencil"
                size={SECONDARY_ICON_SIZE}
                color={colors.onSurface}
                onPress={() => setEdit(true)}
              />
            ),
          })}
    />
  );
};
