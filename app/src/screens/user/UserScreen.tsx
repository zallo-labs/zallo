import { CheckIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { UserConfig, UserId } from 'lib';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useUpsertUser } from '~/mutations/user/upsert/useUpsertUser';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useUser } from '~/queries/user/useUser.api';
import { UserAppbar } from './UserAppbar';
import { EditableUserName } from './EditableUserName';
import { ScrollView } from 'react-native';
import { SpendingCard } from './SpendingCard/SpendingCard';
import { ApproversCard } from './ApproversCard';
import { FabSpacing } from '~/components/FabSpacing';
import { Provider } from 'react-native-paper';
import { useTheme } from '@theme/paper';
import { ConfigSelectorSheet } from './ConfigSelectorSheet/ConfigSelectorSheet';
import { useActivateAccount } from '~/mutations/account/useActivateAccount.api';
import { useAccount } from '~/queries/account/useAccount.api';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { UserScreenContextProvider } from './UserScreenContext';
import { ProposableLabel } from './ProposableLabel';
import produce from 'immer';

export interface UserScreenParams {
  user: UserId;
  config?: UserConfig;
}

export type UserScreenProps = RootNavigatorScreenProps<'User'>;

const UserScreen = ({ navigation, route }: UserScreenProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [user] = useUser(route.params.user);
  const [account] = useAccount(user);
  const canActivateAccount = !!useActivateAccount(account);
  const [upsert, upserting] = useUpsertUser(user.account);

  const [editingName, setEditingName] = useState(false);

  const initialConfig = route.params.config ?? user.configs.value[0];
  const isProposed = useMemo(
    () => !!user.configs.proposed?.some((c) => _.isEqual(c, initialConfig)),
    [initialConfig, user.configs.proposed],
  );
  const isNew = useMemo(
    () =>
      !isProposed &&
      !user.configs.active?.some((c) =>
        _.isEqual(c.approvers, initialConfig.approvers),
      ),
    [initialConfig.approvers, isProposed, user.configs.active],
  );

  const [config, setConfig] = useState(initialConfig);
  const isModified = !_.isEqual(config, initialConfig);
  const canApply = isNew || isModified;

  return (
    <UserScreenContextProvider>
      <Provider theme={useTheme()}>
        <Box flex={1}>
          <UserAppbar
            user={user}
            AppbarHeader={AppbarHeader}
            editName={() => setEditingName(true)}
            undo={isModified ? () => setConfig(initialConfig) : undefined}
          />

          <ScrollView
            style={styles.container}
            onScroll={handleScroll}
            showsVerticalScrollIndicator={false}
          >
            <EditableUserName
              user={user}
              editing={editingName}
              setEditing={setEditingName}
              style={styles.name}
            />

            {isProposed && (
              <ProposableLabel
                proposal={user.configs.proposal}
                variant="titleLarge"
              />
            )}

            <SpendingCard
              user={user}
              config={config}
              setConfig={setConfig}
              style={styles.card}
            />

            <ApproversCard
              user={user}
              approvers={config.approvers}
              onChange={(approvers) => setConfig((c) => ({ ...c, approvers }))}
              style={styles.card}
            />

            {canApply && <FabSpacing />}
          </ScrollView>

          {canActivateAccount ? (
            <ActivateAccountButton account={account}>
              {(props) => <FAB {...props} label="Activate account" />}
            </ActivateAccountButton>
          ) : (
            canApply && (
              <FAB
                icon={CheckIcon}
                label="Apply"
                loading={upserting}
                onPress={() => {
                  const newUser = produce(user, (user) => {
                    const configs =
                      user.configs.proposed ?? user.configs.active!;

                    const i = configs.findIndex((c) =>
                      _.isEqual(c.approvers, initialConfig.approvers),
                    );
                    configs[i >= 0 ? i : configs.length] = config;

                    user.configs.proposed = configs;
                  });

                  upsert(newUser, () => {
                    navigation.setParams({ config });
                  });
                }}
              />
            )
          )}

          <ConfigSelectorSheet
            user={user}
            initialConfig={initialConfig}
            setConfig={(config) => {
              setConfig(config);
              navigation.setParams({ config });
            }}
          />
        </Box>
      </Provider>
    </UserScreenContextProvider>
  );
};

const useStyles = makeStyles(({ space }) => ({
  container: {
    marginHorizontal: space(2),
  },
  name: {
    marginVertical: space(1),
  },
  card: {
    marginTop: space(1),
  },
}));

export default withSkeleton(UserScreen, ScreenSkeleton);
