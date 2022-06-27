import { HomeScreenProps } from '@features/home/HomeScreen';
import { useNavigation } from '@react-navigation/native';
import { Appbar, useTheme } from 'react-native-paper';

export const AppbarBack = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { colors } = useTheme();

  return <Appbar.BackAction onPress={navigation.goBack} color={colors.onSurface} />;
};
