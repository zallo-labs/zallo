// PaneNavigator.tsx
import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  ParamListBase,
  TabNavigationState,
  useNavigationBuilder,
  StackRouter,
} from '@react-navigation/native';
import { Screen } from '@react-navigation/elements';
import { Panes } from './Panes';
import { PaneProps } from './Pane';
import { withLayoutContext } from 'expo-router';
import { BREAKPOINTS, createStyles, useStyles } from '@theme/styles';

const MAX_PANES: Record<keyof typeof BREAKPOINTS, number> = {
  compact: 1,
  medium: 1,
  expanded: 2,
  large: 2,
  extraLarge: 3,
  // Injected by unistyles; never actually used
  landscape: 1,
  portrait: 1,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type PanesNavigationEventMap = {};

export interface PanesNavigationOptions {
  pane?: PaneProps;
  maxPanes?: number;
}

export type PanesNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  TabNavigationState<ParamListBase>,
  PanesNavigationOptions,
  PanesNavigationEventMap
>;

function PanesNavigator({ initialRouteName, screenOptions, children }: PanesNavigatorProps) {
  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder(StackRouter, {
    children,
    screenOptions,
    initialRouteName,
  });
  const { breakpoint } = useStyles();

  const maxPanes = MAX_PANES[breakpoint];
  const routes = state.routes
    .map((route) => ({
      ...route,
      position: state.routeNames.indexOf(route.name),
    }))
    .sort((a, b) => a.position - b.position);

  return (
    <NavigationContent>
      <Panes>
        {routes.map((route, i) => {
          const { navigation, render, options } = descriptors[route.key];

          const focussed = state.index === i;
          const shown = routes.length - maxPanes <= i;

          return (
            <Screen
              key={route.key}
              focused={focussed}
              route={route}
              navigation={navigation}
              header={null}
              headerShown={false}
              style={shown ? styles.visible : styles.hidden}
            >
              {render()}
            </Screen>
          );
        })}
      </Panes>
    </NavigationContent>
  );
}

export const createPanesNavigator = () =>
  withLayoutContext(
    createNavigatorFactory<
      TabNavigationState<ParamListBase>,
      PanesNavigationOptions,
      PanesNavigationEventMap,
      typeof PanesNavigator
    >(PanesNavigator)().Navigator,
  );

const styles = createStyles({
  visible: {},
  hidden: {
    display: 'none',
  },
});
