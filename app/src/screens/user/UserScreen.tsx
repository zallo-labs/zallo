import { PlusIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { UserId } from 'lib';
import { FlatList } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useUser } from '~/queries/user/useUser.api';
import { UserAppbar } from './UserAppbar';
import { UserConfigItem } from './UserConfigItem';

export interface UserScreenParams {
  user: UserId;
}

export type UserScreenProps = RootNavigatorScreenProps<'User'>;

const UserScreen = ({ navigation, route }: UserScreenProps) => {
  const styles = useStyles();
  const [user] = useUser(route.params.user);

  // console.log(JSON.stringify(user.configs, null, 2));

  return (
    <Box flex={1}>
      <UserAppbar user={user} />

      <FlatList
        renderItem={({ item }) => (
          <Box>
            <UserConfigItem
              user={user}
              config={item}
              style={styles.item}
              onPress={() => {
                // TODO: navigate to UserConfig
                // navigation.navigate('UserConfig', {})
              }}
            />
            <Divider />
          </Box>
        )}
        ListFooterComponent={
          <Button
            icon={PlusIcon}
            mode="text"
            style={styles.create}
            onPress={() => {
              // TODO: create new config
            }}
          >
            Config
          </Button>
        }
        data={user.configs.value}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  item: {
    padding: space(2),
  },
  create: {
    alignSelf: 'flex-end',
    marginTop: space(1),
    marginHorizontal: space(2),
  },
}));

export default withSkeleton(UserScreen, ScreenSkeleton);
