import { useNavigation } from '@react-navigation/native';
import { BottomNavigatorScreenProps } from './BottomNavigator';
import { RootNavigatorParamList } from './RootNavigator';

export type RootNavigation = BottomNavigatorScreenProps<'Home'>['navigation'];
export type Navigate = RootNavigation['navigate'];

export const useRootNavigation = () => useNavigation<RootNavigation>();

type StateRoute<Route extends keyof RootNavigatorParamList> = {
  name: Route;
  params: RootNavigatorParamList[Route];
};

export const toNavigationStateRoutes = <Route extends keyof RootNavigatorParamList>(
  ...routes: StateRoute<Route>[]
) => routes;
