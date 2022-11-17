import { ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';

type BackActionProps = ComponentPropsWithoutRef<typeof Appbar.BackAction>;

export const AppbarBack = (props: Partial<BackActionProps>) => {
  const navigation = useRootNavigation();

  return (
    <Appbar.BackAction disabled={!navigation.canGoBack()} onPress={navigation.goBack} {...props} />
  );
};
