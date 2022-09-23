import { CheckIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import produce from 'immer';
import { upsertItem, UserId } from 'lib';
import _ from 'lodash';
import { useState } from 'react';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { Box } from '~/components/layout/Box';
import { ProposableButton } from '~/components/proposable/ProposableButton';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useUpsertUser } from '~/mutations/user/upsert/useUpsertUser';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useUser } from '~/queries/user/useUser.api';
import { UserAppbar } from './UserAppbar';
import { EditableUserName } from './EditableUserName';
import { ScrollView } from 'react-native';
import { ConfigSelectorChip } from './ConfigSelectorChip';
import { SpendingCard } from './SpendingCard/SpendingCard';

export interface UserScreenParams {
  user: UserId;
}

export type UserScreenProps = RootNavigatorScreenProps<'User'>;

const UserScreen = ({ navigation, route }: UserScreenProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [user] = useUser(route.params.user);
  const [upsert, upserting] = useUpsertUser(user.account);

  const selectedConfig = user.configs.value[0];
  const [config, setConfig] = useState(selectedConfig);
  const isModified = !_.isEqual(selectedConfig, config);

  return (
    <Box flex={1}>
      <UserAppbar user={user} AppbarHeader={AppbarHeader} />

      <ScrollView onScroll={handleScroll} style={styles.container}>
        <EditableUserName user={user} style={styles.name} />

        <Box horizontal justifyContent="space-between">
          <ConfigSelectorChip />
          <ProposableButton proposable={user.configs} />
        </Box>

        <SpendingCard
          user={user}
          config={config}
          setConfig={setConfig}
          style={styles.card}
        />
      </ScrollView>

      {isModified && (
        <FAB
          icon={CheckIcon}
          label="Apply"
          loading={upserting}
          onPress={() => {
            upsert(
              produce(user, (user) => {
                user.configs.proposed = upsertItem(
                  user.configs.proposed ?? undefined,
                  config,
                  (c) => _.isEqual(c.approvers, config.approvers),
                );
              }),
            );
          }}
        />
      )}
    </Box>
  );
};

const useStyles = makeStyles(({ space }) => ({
  container: {
    marginHorizontal: space(2),
  },
  name: {
    marginVertical: space(2),
  },
  card: {
    marginTop: space(2),
  },
}));

export default withSkeleton(UserScreen, ScreenSkeleton);
