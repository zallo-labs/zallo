import { IconProps, MenuIcon } from '~/util/theme/icons';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export const AppbarMenu = () => {
  const navigation = useNavigation();

  return (
    <Appbar.Action
      icon={MenuIcon}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    />
  );
};

export const AppbarMenu2 = (props: IconProps) => {
  const { dispatch } = useNavigation();

  return <MenuIcon {...props} onPress={() => dispatch(DrawerActions.openDrawer())} />;
};
