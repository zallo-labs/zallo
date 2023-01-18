import { useSearch } from '@hook/useSearch';
import { SearchIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Address, QuorumGuid } from 'lib';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { ListHeader } from '~/components/list/ListHeader';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccount } from '~/queries/account/useAccount.api';
import { QuorumItem } from './QuorumItem';

export type OnSelectQuorum<R = void> = (quorum: QuorumGuid) => R;

export interface AccountQuorumsScreenParams {
  account: Address;
  onSelect?: OnSelectQuorum;
  onlyActive?: boolean;
}

export type AccountQuorumsScreenProps = StackNavigatorScreenProps<'AccountQuorums'>;

export const AccountQuorumsScreen = ({ route, navigation }: AccountQuorumsScreenProps) => {
  const { onSelect, onlyActive } = route.params;
  const styles = useStyles();
  const account = useAccount(route.params.account);

  const [quorums, searchProps] = useSearch(
    onlyActive ? account.quorums.filter((q) => q.active) : account.quorums,
    ['name', 'key'],
  );

  return (
    <SafeAreaView style={styles.root}>
      <Searchbar
        leading={AppbarBack2}
        placeholder="Search quorums"
        trailing={SearchIcon}
        onFocus={() => console.log('Focused')}
        {...searchProps}
      />

      <FlatList
        data={quorums}
        ListHeaderComponent={<ListHeader>Quorums</ListHeader>}
        renderItem={({ item: quorum }) => (
          <QuorumItem
            quorum={quorum}
            onPress={() => {
              onSelect ? onSelect(quorum) : navigation.navigate('Quorum', { quorum });
            }}
          />
        )}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        extraData={[onSelect, navigation.navigate]}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles(({ s, colors }) => ({
  root: {
    marginTop: s(16),
  },
  container: {
    paddingVertical: s(8),
  },
}));
