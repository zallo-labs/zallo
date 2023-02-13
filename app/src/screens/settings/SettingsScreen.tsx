import { UserIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ScrollView } from 'react-native';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { Box } from '~/components/layout/Box';
import { ListItem } from '~/components/list/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export type SettingsScreenProps = StackNavigatorScreenProps<'Settings'>;

export const SettingsScreen = ({ navigation: { navigate } }: SettingsScreenProps) => {
  const styles = useStyles();

  return (
    <Box style={styles.root}>
      <AppbarLarge leading={'menu'} headline="Settings" />

      <ScrollView contentContainerStyle={styles.list}>
        <ListItem
          leading={UserIcon}
          headline="User"
          supporting="View user information"
          onPress={() => navigate('Device')}
        />
      </ScrollView>
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
  root: {
    flex: 1,
  },
  list: {
    marginVertical: s(8),
  },
}));
