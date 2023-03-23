import { SearchInputProps } from '@hook/useSearch';
import { BackIcon, CloseIcon } from '@theme/icons';
import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Divider, Surface } from 'react-native-paper';
import { useGoBack } from '../Appbar/useGoBack';
import { BasicTextField, BasicTextFieldProps } from '../fields/BasicTextField';
import { Box } from '../layout/Box';

export type SearchViewProps = SearchInputProps &
  BasicTextFieldProps & {
    children: ReactNode[];
  };

export const SearchView = ({ children, value, onChangeText, ...inputProps }: SearchViewProps) => {
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

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
  },
  icon: {
    fontSize: 24,
    marginHorizontal: 16,
  },
  contentContainer: {
    marginVertical: 8,
  },
});
