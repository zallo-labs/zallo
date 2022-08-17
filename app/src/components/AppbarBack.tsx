import { useNavigation } from '@react-navigation/native';
import { ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';

type BackActionProps = ComponentPropsWithoutRef<typeof Appbar.BackAction>;

export const AppbarBack = (props: Partial<BackActionProps>) => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();

  return (
    <Appbar.BackAction
      disabled={!navigation.canGoBack()}
      onPress={navigation.goBack}
      {...props}
    />
  );
};
