import { AccountId } from '@api/account';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';

export interface HomeScreenParams {
  account?: AccountId;
}

export type HomeScreenProps = StackNavigatorScreenProps<'Home'>;

export const HomeScreen = (props: HomeScreenProps) => {
  return null;
};
