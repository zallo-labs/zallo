import { HomeScreenProps } from '@features/home/HomeScreen';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';

export const AppbarBack = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  return <Appbar.BackAction onPress={navigation.goBack} />;
};
