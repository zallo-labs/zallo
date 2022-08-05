import { HomeScreenProps } from '@features/home/HomeScreen';
import { useNavigation } from '@react-navigation/native';

export const useGoBack = () =>
  useNavigation<HomeScreenProps['navigation']>().goBack;
