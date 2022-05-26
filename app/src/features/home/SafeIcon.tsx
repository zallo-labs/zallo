import { Identicon } from '@components/Identicon';
import { useSafe } from '@features/safe/SafeProvider';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import { HomeScreenProps } from './HomeScreen';

export const SafeIcon = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { safe } = useSafe();

  return (
    <Pressable onPress={() => navigation.push('SafeManagement')}>
      <Identicon seed={safe.address} />
    </Pressable>
  );
};
