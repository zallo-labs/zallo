import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackNavigatorParamList } from './StackNavigator';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends StackNavigatorParamList {}
  }
}

export type StackNavigation = StackNavigationProp<StackNavigatorParamList>;
export const useStackNavigation = () => useNavigation<StackNavigation>();
