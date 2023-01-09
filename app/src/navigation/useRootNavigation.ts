import { useNavigation } from '@react-navigation/native';
import { BottomNavigatorParamList, BottomNavigatorScreenProps } from './BottomNavigator';
import { StackNavigatorParamList } from './StackNavigator';

/*
 * Navigation:
 * -> Drawer navigator
 *    -> Stack navigator
 *       -> Bottom navigator
 */
export type RootParamList = StackNavigatorParamList & BottomNavigatorParamList;
export type RootNavigation = BottomNavigatorScreenProps<'Home'>['navigation'];
export type Navigate = RootNavigation['navigate'];

export const useRootNavigation = () => useNavigation<RootNavigation>();

type StateRoute<Route extends keyof RootParamList> = {
  name: Route;
  params: RootParamList[Route];
};

export const toNavigationStateRoutes = <Route extends keyof RootParamList>(
  ...routes: StateRoute<Route>[]
) => routes;
