import { Box } from '@components/Box';
import { BasicTextField } from '@components/fields/BasicTextField';
import { CancelIcon, SearchIcon } from '@util/theme/icons';
import { useTheme } from '@util/theme/paper';
import { ReactNode } from 'react';
import { Appbar } from 'react-native-paper';
import { FuzzySearchProps } from './useFuzzySearch';

export interface AppbarSearchProps extends FuzzySearchProps {
  title?: ReactNode;
}

export const AppbarSearch = ({ title, input, setInput }: AppbarSearchProps) => {
  const { typescale } = useTheme();

  if (input === undefined)
    return (
      <>
        <Appbar.Content title={title} />
        <Appbar.Action icon={SearchIcon} onPress={() => setInput('')} />
      </>
    );

  return (
    <>
      <Box flex={1}>
        <BasicTextField
          value={input}
          onChangeText={setInput}
          placeholder="Search"
          style={typescale.titleLarge}
        />
      </Box>

      <Appbar.Action icon={CancelIcon} onPress={() => setInput(undefined)} />
    </>
  );
};
