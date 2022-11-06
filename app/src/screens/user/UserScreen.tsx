import { useMemo, useState } from 'react';
import { UserConfig, UserId } from 'lib';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { UserDetails } from './UserDetails';
import { useUser } from '~/queries/user/useUser.api';
import { ConfigSelectorSheet, ProposedConfigs } from './ConfigSelectorSheet/ConfigSelectorSheet';
import { UserScreenContextProvider } from './UserScreenContext';

export interface UserScreenParams {
  user: UserId;
  config?: UserConfig;
  proposed?: ProposedConfigs;
}

export type UserScreenProps = RootNavigatorScreenProps<'User'>;

const UserScreen = ({ navigation, route }: UserScreenProps) => {
  const [user] = useUser(route.params.user);

  const initialConfig = route.params.config ?? user.configs.value[0];
  const [config, setConfig] = useState(initialConfig);

  const selectConfig = (config: UserConfig) => {
    navigation.setParams({ config });
    setConfig(config);
  };

  const proposed = useMemo(
    () =>
      route.params.proposed ??
      (user.configs.proposed
        ? {
            configs: user.configs.proposed,
            proposal: user.configs.proposal,
          }
        : undefined),
    [route.params.proposed, user.configs.proposal, user.configs.proposed],
  );

  return (
    <UserScreenContextProvider>
      <UserDetails
        user={user}
        initialConfig={initialConfig}
        config={config}
        setConfig={setConfig}
        selectConfig={selectConfig}
        proposed={proposed}
      />

      <ConfigSelectorSheet
        user={user}
        selected={initialConfig}
        select={selectConfig}
        proposedConfigs={proposed}
      />
    </UserScreenContextProvider>
  );
};

export default withSkeleton(UserScreen, ScreenSkeleton);
