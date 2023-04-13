import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackNavigatorParamList as StackNavigatorParamList2 } from './StackNavigator2';

export type RootParamList2 = StackNavigatorParamList2;
export type RootNavigation2 = StackNavigationProp<RootParamList2>;
export type Navigate2 = RootNavigation2['navigate'];
export const useRootNavigation2 = () => useNavigation<RootNavigation2>();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootParamList2 {}
  }
}

export type RootNavigation = StackNavigationProp<RootParamList2>;

// export type RootNavigation = CompositeNavigationProp<
//   DrawerNavigationNavigateProp,
//   CompositeNavigationProp<StackNavigatorNavigationProp, BottomNavigatorNavigatonProp>
// >;

export type Navigate = RootNavigation['navigate'];

export const useRootNavigation = () => useNavigation<RootNavigation>();

type StateRoute<Route extends keyof RootParamList2> = {
  name: Route;
  params: RootParamList2[Route];
};

export const toNavigationStateRoutes = <Route extends keyof RootParamList2>(
  ...routes: StateRoute<Route>[]
) => routes;

export type OnlyRouteParamsScreenProps<T extends keyof RootParamList2> = {
  route: {
    params: RootParamList2[T];
  };
};
