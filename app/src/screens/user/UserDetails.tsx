import { CheckIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { UserConfig } from 'lib';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { FAB } from '~/components/FAB';
import { Box } from '~/components/layout/Box';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { CombinedUser } from '~/queries/user/useUser.api';
import { UserAppbar } from './UserAppbar';
import { EditableUserName } from './EditableUserName';
import { ScrollView } from 'react-native';
import { SpendingCard } from './SpendingCard/SpendingCard';
import { ApproversCard } from './ApproversCard';
import { FabSpacing } from '~/components/FabSpacing';
import { Provider } from 'react-native-paper';
import { useTheme } from '@theme/paper';
import { useActivateAccount } from '~/mutations/account/useActivateAccount.api';
import { useAccount } from '~/queries/account/useAccount.api';
import { ActivateAccountButton } from '~/components/account/ActivateAccountButton';
import { ProposableLabel } from './ProposableLabel';
import { ProposedConfigs } from './ConfigSelectorSheet/ConfigSelectorSheet';

export interface UserDetailsProps {
  user: CombinedUser;
  initialConfig: UserConfig;
  config: UserConfig;
  setConfig: (config: UserConfig) => void;
  proposed?: ProposedConfigs;
  submit: () => void;
  isModified: boolean;
}

export const UserDetails = ({
  user,
  initialConfig,
  config,
  setConfig,
  proposed,
  submit,
  isModified,
}: UserDetailsProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const [account] = useAccount(user);
  const canActivateAccount = !!useActivateAccount(account);

  const [editingName, setEditingName] = useState(false);

  const isProposed = useMemo(
    () => !!proposed?.configs.some((c) => _.isEqual(c, initialConfig)),
    [initialConfig, proposed?.configs],
  );
  const canApply = useMemo(() => {
    const isNew = () =>
      !isProposed &&
      !user.configs.active?.some((c) =>
        _.isEqual(c.approvers, initialConfig.approvers),
      );

    return isModified || isNew();
  }, [initialConfig.approvers, isModified, isProposed, user.configs.active]);

  return (
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
            onChange={(approvers) => setConfig({ ...config, approvers })}
            style={styles.card}
          />

          {canApply && <FabSpacing />}
        </ScrollView>

        {canActivateAccount ? (
          <ActivateAccountButton account={account}>
            {(props) => <FAB {...props} label="Activate account" />}
          </ActivateAccountButton>
        ) : (
          canApply && <FAB icon={CheckIcon} label="Apply" onPress={submit} />
        )}
      </Box>
    </Provider>
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
