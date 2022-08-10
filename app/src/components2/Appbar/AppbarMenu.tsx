import { useNavigation } from '@react-navigation/native';
import { MenuIcon } from '@util/theme/icons';
import { Appbar } from 'react-native-paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';

export const AppbarMenu = () => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();

  return <Appbar.Action icon={MenuIcon} onPress={navigation.openDrawer} />;
};
