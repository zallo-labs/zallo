import { Box } from '@components/Box';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { SafeNameField } from './SafeNameField';
import { Header } from '@components/Header';
import { SafeIcon } from '@features/home/SafeIcon';
import { useSafe } from '@features/safe/SafeProvider';
import { FlatList } from 'react-native';
import { GroupItem } from './GroupItem';
import { ActionsSpaceFooter } from '@components/ActionsSpaceFooter';
import { Divider } from 'react-native-paper';

export type SafeManagementScreenProps =
  RootNavigatorScreenProps<'SafeManagement'>;

export const SafeManagementScreen = (_props: SafeManagementScreenProps) => {
  const { groups } = useSafe();

  return (
    <Box flex={1}>
      <FlatList
        ListHeaderComponent={
          <Header
            Middle={<SafeNameField />}
            Right={<SafeIcon />}
            mx={2}
            mt={3}
          />
        }
        data={groups}
        renderItem={({ item }) => <GroupItem group={item} mx={2} my={2} />}
        keyExtractor={(group) => group.id}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={ActionsSpaceFooter}
      />
    </Box>
  );
};
