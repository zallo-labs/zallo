import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';

export const AppbarBack = () => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();

  return <Appbar.BackAction disabled={!navigation.canGoBack()} onPress={navigation.goBack} />;
};
