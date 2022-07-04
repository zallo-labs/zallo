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
  target: NavTarget<Route>,
  v?: Value,
) => {
  if (!isNested(target)) {
    return navigation.navigate({
      name: target.route,
      params: target.params,
      merge: true,
    });
  }

  const params = target.target
    ? {
        ...target.params,
        target: {
          ...target.target,
          params: {
            ...target.target.params,
            [target.output]: v,
          },
        },
      }
    : {
        ...target.params,
        [target.output]: v,
      };

  navigation.navigate({
    name: target.route,
    params,
    merge: true,
  });
};
