import { NavigationHelpers } from '@react-navigation/native';
import { RootNavigatorParamList } from './RootNavigator';

export interface FinalNavTarget<Route extends keyof RootNavigatorParamList> {
  route: Route;
  params?: any;
}

export interface NestedNavTarget<Route extends keyof RootNavigatorParamList>
  extends FinalNavTarget<Route> {
  output: string;
  target?: NavTarget<any>;
}

export type NavTarget<Route extends keyof RootNavigatorParamList = any> =
  | FinalNavTarget<Route>
  | NestedNavTarget<Route>;

const isNested = <Route extends keyof RootNavigatorParamList>(
  n: NavTarget<Route>,
): n is NestedNavTarget<Route> => 'output' in n;

export const navToTarget = <Value, Route extends keyof RootNavigatorParamList>(
  navigation: Pick<NavigationHelpers<RootNavigatorParamList>, 'navigate'>,
  nav: NavTarget<Route>,
  v?: Value,
) => {
  if (!isNested(nav)) {
    return navigation.navigate({
      name: nav.route,
      params: nav.params,
      merge: true,
    });
  }

  const params = nav.target
    ? {
        ...nav.params,
        target: {
          ...nav.target,
          params: {
            ...nav.target.params,
            [nav.output]: v,
          },
        },
      }
    : {
        ...nav.params,
        [nav.output]: v,
      };

  navigation.navigate({
    name: nav.route,
    params,
    merge: true,
  });
};
