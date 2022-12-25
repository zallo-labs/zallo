import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address, QuorumGuid } from 'lib';
import { FlatList } from 'react-native-gesture-handler';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AccountAppbar } from './AccountAppbar';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { FAB } from '~/components/FAB';
import { useAccount } from '~/queries/account/useAccount.api';
import { QuorumItem } from './QuorumItemCard';
import { useFuzzySearch } from '@hook/useFuzzySearch';
import { TextField } from '~/components/fields/TextField';
import { TextInput } from 'react-native-paper';
import { SearchIcon } from '@theme/icons';

export type OnSelectQuorum = (quorum: QuorumGuid) => void;

export interface AccountScreenParams {
  account: Address;
  onSelectQuorum?: OnSelectQuorum;
  title?: string;
  onlyActive?: boolean;
}

export type AccountScreenProps = RootNavigatorScreenProps<'Account'>;

export const AccountScreen = withSkeleton(
  ({
    navigation: { navigate },
    route: {
      params: { account: accountAddr, onSelectQuorum, title, onlyActive },
    },
  }: AccountScreenProps) => {
    const styles = useStyles();
    const account = useAccount(accountAddr);
    const { AppbarHeader, handleScroll } = useAppbarHeader();

    const quorums = onlyActive ? account.quorums.filter((q) => q.active) : account.quorums;
    const [filteredQuorums, searchProps] = useFuzzySearch(quorums, ['name', 'key']);

    return (
      <Box flex={1}>
        <AccountAppbar AppbarHeader={AppbarHeader} title={title} account={account} />

        <FlatList
          ListHeaderComponent={
            <TextField
              left={<TextInput.Icon icon={SearchIcon} />}
              label="Search users"
              {...searchProps}
            />
          }
          renderItem={({ item: quorum }) => (
            <QuorumItem
              quorum={quorum}
              onPress={() => {
                if (onSelectQuorum) {
                  onSelectQuorum(quorum);
                } else {
                  navigate('Quorum', { quorum });
                }
              }}
            />
          )}
          data={filteredQuorums}
          ListHeaderComponentStyle={styles.header}
          extraData={[onSelectQuorum, navigate]}
          stickyHeaderIndices={[0]}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        />

        <ActivateAccountButton account={account}>{FAB}</ActivateAccountButton>
      </Box>
    );
  },
  ScreenSkeleton,
);

const useStyles = makeStyles(({ space }) => ({
  header: {
    marginHorizontal: space(2),
    marginBottom: space(1),
  },
}));
