import { BasicTextField } from '~/components/fields/BasicTextField';
import { Box } from '~/components/layout/Box';
import { CancelIcon, SearchIcon } from '~/util/theme/icons';
import { useTheme } from '@theme/paper';
import { ReactNode } from 'react';
import { Appbar } from 'react-native-paper';
import { FuzzySearchProps } from '../../util/hook/useFuzzySearch';

export interface AppbarSearchProps extends FuzzySearchProps {
  title?: ReactNode;
  actions?: ReactNode;
}

export const AppbarSearch = ({
  title,
  actions,
  value,
  onChangeText,
}: AppbarSearchProps) => {
  const { typescale } = useTheme();

  if (value === undefined)
    return (
      <>
        <Appbar.Content title={title} />
        {actions}
        <Appbar.Action icon={SearchIcon} onPress={() => onChangeText('')} />
      </>
    );

  return (
    <>
      <Box flex={1}>
        <BasicTextField
          value={value}
          onChangeText={onChangeText}
          placeholder="Search"
          style={typescale.titleLarge}
        />
      </Box>

      <Appbar.Action
        icon={CancelIcon}
        onPress={() => onChangeText(undefined)}
      />
    </>
  );
};
