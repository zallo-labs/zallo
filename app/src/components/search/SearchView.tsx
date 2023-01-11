import { SearchInputProps } from '@hook/useSearch';
import { BackIcon, CloseIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ReactNode } from 'react';
import { Divider, Surface } from 'react-native-paper';
import { useGoBack } from '../Appbar/useGoBack';
import { BasicTextField, BasicTextFieldProps } from '../fields/BasicTextField';
import { Box } from '../layout/Box';

export type SearchViewProps = SearchInputProps &
  BasicTextFieldProps & {
    children: ReactNode[];
  };

export const SearchView = ({ children, value, onChangeText, ...inputProps }: SearchViewProps) => {
  const styles = useStyles();

  return (
    <Surface elevation={3}>
      <Box style={styles.searchContainer}>
        <BackIcon style={styles.icon} onPress={useGoBack()} />

        <BasicTextField value={value} onChangeText={onChangeText} {...inputProps} />

        <CloseIcon style={styles.icon} onPress={() => onChangeText('')} />
      </Box>

      <Divider />

      <Box style={styles.contentContainer}>{children}</Box>
    </Surface>
  );
};

const useStyles = makeStyles(({ s }) => ({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: s(72),
  },
  icon: {
    fontSize: s(24),
    marginHorizontal: s(16),
  },
  contentContainer: {
    marginVertical: s(8),
  },
}));
