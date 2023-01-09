import { Box } from '~/components/layout/Box';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FlatList } from 'react-native';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Token } from '@token/token';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { Address, QuorumGuid } from 'lib';
import { useTokens } from '@token/useTokens';
import { Appbar, TextInput } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { TextField } from '~/components/fields/TextField';
import { SearchIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import TokenItem from '~/components/token/TokenItem';
import { TokenAvailableItem } from '~/components/token/TokenAvailableItem';

export interface TokensScreenParams {
  onSelect?: (token: Token) => void;
  quorum?: QuorumGuid;
  disabled?: Address[];
}

export type TokensScreenProps = StackNavigatorScreenProps<'Tokens'>;

const TokensScreen = ({ route }: TokensScreenProps) => {
  const { onSelect, quorum, disabled } = route.params;
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [tokens, searchProps] = useFuzzySearch(useTokens(), ['name', 'symbol']);

  return (
    <Box>
      <AppbarHeader mode="medium">
        <Appbar.BackAction onPress={useGoBack()} />
        <Appbar.Content title={onSelect ? 'Select Token' : 'Tokens'} />
        {/* <Appbar.Action icon={AddIcon} onPress={() => {
          // TODO: implement add dynamic token
        }} /> */}
      </AppbarHeader>

      <FlatList
        ListHeaderComponent={
          <TextField left={<TextInput.Icon icon={SearchIcon} />} label="Search" {...searchProps} />
        }
        ListHeaderComponentStyle={styles.header}
        renderItem={({ item: token }) => {
          const onPress = onSelect ? () => onSelect(token) : undefined;
          const isDisabled = !!disabled?.find((t) => t === token.addr);

          return quorum ? (
            <TokenAvailableItem
              token={token}
              onPress={onPress}
              disabled={isDisabled}
              quorum={quorum}
            />
          ) : (
            <TokenItem token={token} onPress={onPress} disabled={isDisabled} />
          );
        }}
        data={tokens}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  header: {
    marginHorizontal: space(2),
    marginBottom: space(1),
  },
}));

export default withSkeleton(TokensScreen, ListScreenSkeleton);
