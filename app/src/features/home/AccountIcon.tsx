import { Identicon } from '@components/Identicon';
import { useAccount } from '@features/account/AccountProvider';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { HomeScreenProps } from './HomeScreen';

export const AccountIcon = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { contract: account } = useAccount();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('AccountManagement')}>
      <Identicon seed={account.address} />
    </TouchableOpacity>
  );
};
