import { Appbar } from 'react-native-paper';
import { useGoBack } from '~/components2/Appbar/useGoBack';

export const AppbarBack = () => <Appbar.BackAction onPress={useGoBack()} />;
