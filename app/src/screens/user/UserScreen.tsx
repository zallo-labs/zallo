import { useMemo } from 'react';
import { UserId, UserConfig } from 'lib';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { UserDetails } from './UserDetails';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useUser } from '~/queries/user/useUser.api';
import { useUpsertUser } from '~/mutations/user/upsert/useUpsertUser';
import produce from 'immer';
import {
  ConfigSelectorSheet,
  ProposedConfigs,
} from './ConfigSelectorSheet/ConfigSelectorSheet';
import _ from 'lodash';
import { UserScreenContextProvider } from './UserScreenContext';

interface Values {
  config: UserConfig;
}

export interface UserScreenParams {
  user: UserId;
  config?: UserConfig;
  proposed?: ProposedConfigs;
}

export type UserScreenProps = RootNavigatorScreenProps<'User'>;

const UserScreen = ({ navigation, route }: UserScreenProps) => {
  const [user] = useUser(route.params.user);
  const [upsert] = useUpsertUser(user.account);

  const initialConfig = route.params.config ?? user.configs.value[0];
  const { getValues, setValue, handleSubmit, reset, getFieldState } =
    useForm<Values>({
      defaultValues: {
        config: initialConfig,
      },
    });

  const [config, setConfig] = [
    getValues('config'),
    (config: UserConfig) => setValue('config', config),
  ];

  const selectConfig = (config: UserConfig) => {
    navigation.setParams({ config });
    reset();
  };

  const onSubmit: SubmitHandler<Values> = ({ config }) => {
    const newUser = produce(user, (user) => {
      const configs = user.configs.proposed ?? user.configs.active!;

      const i = configs.findIndex((c) =>
        _.isEqual(c.approvers, initialConfig.approvers),
      );
      configs[i >= 0 ? i : configs.length] = config;

      user.configs.proposed = configs;
    });

    upsert(newUser, () => {
      selectConfig(config);
    });
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
        submit={handleSubmit(onSubmit)}
        isModified={getFieldState('config').isDirty}
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
