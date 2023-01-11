import { useSearch } from '@hook/useSearch';
import { BackIcon, SearchIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Address, QuorumGuid } from 'lib';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { Searchbar } from '~/components/fields/Searchbar';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccount } from '~/queries/account/useAccount.api';
import { QuorumItem } from './QuorumItem';

export type OnSelectQuorum = (quorum: QuorumGuid) => void;

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
  const goBack = useGoBack();

  const [quorums, searchProps] = useSearch(
    onlyActive ? account.quorums.filter((q) => q.active) : account.quorums,
    ['name', 'key'],
  );

  return (
    <SafeAreaView style={styles.root}>
      <Searchbar
        leading={(props) => <BackIcon {...props} onPress={goBack} />}
        placeholder="Search quorums"
        trailing={SearchIcon}
        onFocus={() => console.log('Focused')}
        {...searchProps}
      />

      <FlatList
        data={quorums}
        ListHeaderComponent={
          <Text variant="bodyLarge" style={styles.header}>
            Quorums
          </Text>
        }
        renderItem={({ item: quorum }) => (
          <QuorumItem
            quorum={quorum}
            onPress={() => {
              if (onSelect) {
                onSelect(quorum);
              } else {
                navigation.navigate('Quorum', { quorum });
              }
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
    marginVertical: s(16),
  },
  container: {
    paddingTop: s(16),
    paddingBottom: s(8),
  },
  header: {
    color: colors.onSurfaceVariant,
    marginHorizontal: s(16),
    marginBottom: s(8),
  },
}));
