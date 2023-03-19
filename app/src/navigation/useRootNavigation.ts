import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomNavigatorNavigatonProp, BottomNavigatorParamList } from './BottomNavigator';
import { DrawerNavigationNavigateProp, DrawerNavigatorParamList } from './Drawer/DrawerNavigator';
import { StackNavigatorNavigationProp, StackNavigatorParamList } from './StackNavigator';
import { StackNavigatorParamList as StackNavigatorParamList2 } from './StackNavigator2';

export type RootParamList2 = StackNavigatorParamList2;
export type RootNavigation2 = StackNavigationProp<RootParamList2>;
export type Navigate2 = RootNavigation2['navigate'];
export const useRootNavigation2 = () => useNavigation<RootNavigation2>();

/*
 * Navigation:
 * -> Drawer navigator
 *    -> Bottom navigator
 *    -> Stack navigator
 *    -> Card modal navigator
 */
export type RootStackParamList = DrawerNavigatorParamList &
  StackNavigatorParamList &
  BottomNavigatorParamList;
// CardModalNavigatorParamList;

// export type RootNavigation = BottomNavigatorScreenProps<'Home'>['navigation'];

export type RootNavigation = StackNavigationProp<ReactNavigation.RootParamList>;

// export type RootNavigation = CompositeNavigationProp<
//   DrawerNavigationNavigateProp,
//   CompositeNavigationProp<StackNavigatorNavigationProp, BottomNavigatorNavigatonProp>
// >;

export type Navigate = RootNavigation['navigate'];

export const useRootNavigation = () => useNavigation<RootNavigation>();

type StateRoute<Route extends keyof RootStackParamList> = {
  name: Route;
  params: RootStackParamList[Route];
};

export const toNavigationStateRoutes = <Route extends keyof RootStackParamList>(
  ...routes: StateRoute<Route>[]
) => routes;

export type OnlyRouteParamsScreenProps<T extends keyof RootStackParamList> = {
  route: {
    params: RootStackParamList[T];
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
