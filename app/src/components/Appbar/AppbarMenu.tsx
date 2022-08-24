import { MenuIcon } from '~/util/theme/icons';
import { Appbar } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export const AppbarMenu = () => {
  const navigation = useRootNavigation();

  return <Appbar.Action icon={MenuIcon} onPress={navigation.openDrawer} />;
};
