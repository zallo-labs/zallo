import { Box } from '@components/Box';
import { BasicTextField } from '@components/fields/BasicTextField';
import { CancelIcon, CheckIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { ReactNode, useState } from 'react';
import { Keyboard } from 'react-native';
import { Appbar } from 'react-native-paper';

export interface AppbarEditableContentProps {
  title: string;
  onSave: (title: string) => void;
  otherActions?: ReactNode[];
}

export const AppbarEditableContent = ({
  title,
  onSave,
  otherActions,
}: AppbarEditableContentProps) => {
  const { typescale } = useTheme();

  const [value, setValue] = useState(title);

  return (
    <>
      <Box flex={1}>
        <BasicTextField
          value={value}
          onChangeText={setValue}
          style={typescale.titleLarge}
        />
      </Box>

      {value !== title ? (
        <>
          <Appbar.Action
            icon={CheckIcon}
            onPress={() => {
              onSave(value);
              Keyboard.dismiss();
            }}
          />
          <Appbar.Action
            icon={CancelIcon}
            onPress={() => {
              setValue(title);
              Keyboard.dismiss();
            }}
          />
        </>
      ) : (
        otherActions
      )}
    </>
  );
};
