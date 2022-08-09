import { Box } from '@components/Box';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { Header } from '@components/Header';
import { AccountIcon } from '@features/home/AccountIcon';
import { useAccount } from '@features/account/AccountProvider';
import { FlatList } from 'react-native';
import { GroupItem } from './GroupItem';
import { ActionsSpaceFooter } from '@components/ActionsSpaceFooter';
import { Divider } from 'react-native-paper';

export type AccountManagementScreenProps =
  RootNavigatorScreenProps<'AccountManagement'>;

export const AccountManagementScreen = (
  _props: AccountManagementScreenProps,
) => {
  const { groups } = useAccount();

  return (
    <Box flex={1}>
      <FlatList
        ListHeaderComponent={<Header Right={<AccountIcon />} mx={2} mt={3} />}
        data={groups}
        renderItem={({ item }) => <GroupItem group={item} mx={2} my={2} />}
        keyExtractor={(group) => group.id}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={ActionsSpaceFooter}
      />
    </Box>
  );
};
