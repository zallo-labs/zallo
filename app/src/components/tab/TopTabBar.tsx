import { ParamListBase, Route, TabNavigationState } from '@react-navigation/core';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { makeStyles } from '@theme/makeStyles';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { TabBar, TabBarIndicator } from 'react-native-tab-view';

export type TopTabBarVariant = 'primary' | 'secondary';

export interface TopTabBarProps extends MaterialTopTabBarProps {
  variant?: TopTabBarVariant;
}

export const TopTabBar = ({
  variant = 'primary',
  state,
  navigation,
  descriptors,
  ...rest
}: TopTabBarProps) => {
  const focusedOptions = descriptors[state.routes[state.index]!.key]!.options;
  const styles = useStyles({ variant, withIcon: !!focusedOptions.tabBarIcon });

  return (
    <TabBar
      {...rest}
      navigationState={state}
      scrollEnabled={focusedOptions.tabBarScrollEnabled}
      bounces={focusedOptions.tabBarBounces ?? false}
      activeColor={styles.active.color}
      inactiveColor={styles.inactive.color}
      pressColor={focusedOptions.tabBarPressColor}
      pressOpacity={focusedOptions.tabBarPressOpacity}
      tabStyle={[focusedOptions.tabBarItemStyle]}
      indicatorStyle={[styles.indicator, focusedOptions.tabBarIndicatorStyle]}
      gap={focusedOptions.tabBarGap}
      android_ripple={focusedOptions.tabBarAndroidRipple}
      indicatorContainerStyle={focusedOptions.tabBarIndicatorContainerStyle}
      contentContainerStyle={focusedOptions.tabBarContentContainerStyle}
      style={[styles.container, focusedOptions.tabBarStyle]}
      getAccessibilityLabel={({ route }) =>
        descriptors[route.key]!.options.tabBarAccessibilityLabel
      }
      getTestID={({ route }) => descriptors[route.key]!.options.tabBarTestID}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        }
      }}
      onTabLongPress={({ route }) =>
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        })
      }
      renderIcon={({ route, focused, color }) => {
        const { options } = descriptors[route.key]!;

        if (options.tabBarShowIcon === false) {
          return null;
        }

        if (options.tabBarIcon !== undefined) {
          const icon = options.tabBarIcon({ focused, color });

          return <View style={[styles.icon, options.tabBarIconStyle]}>{icon}</View>;
        }

        return null;
      }}
      renderLabel={({ route, focused, color }) => {
        const { options } = descriptors[route.key]!;

        if (options.tabBarShowLabel === false) {
          return null;
        }

        const label = options.tabBarLabel ?? options.title ?? (route as Route<string>).name;

        if (typeof label === 'string') {
          return (
            <Text
              style={[styles.label, { color }, options.tabBarLabelStyle]}
              allowFontScaling={options.tabBarAllowFontScaling}
            >
              {label}
            </Text>
          );
        }

        const children =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? route.name;

        return label({ focused, color, children });
      }}
      renderBadge={({ route }) => {
        const { tabBarBadge } = descriptors[route.key]!.options;

        return tabBarBadge?.() ?? null;
      }}
      renderIndicator={({ navigationState: state, ...rest }) => {
        const style =
          variant === 'primary'
            ? (() => {
                // Set indicator width to the width of the label and center
                const route = state.routes[state.index]!;
                const { options } = descriptors[route.key]!;

                const label =
                  typeof options.tabBarLabel === 'string'
                    ? options.tabBarLabel
                    : options.title ?? route.name;

                const totalWidth = rest.getTabWidth(state.index);
                const width = label ? label.length * (styles.label.fontSize - 6) : totalWidth;
                const marginLeft = (totalWidth - width) / 2;

                return { width, marginLeft };
              })()
            : undefined;

        return focusedOptions.tabBarIndicator ? (
          focusedOptions.tabBarIndicator({
            state: state as TabNavigationState<ParamListBase>,
            ...rest,
          })
        ) : (
          <TabBarIndicator navigationState={state} {...rest} style={[rest.style, style]} />
        );
      }}
    />
  );
};

interface StyleParams {
  variant: TopTabBarVariant;
  withIcon?: boolean;
}

const useStyles = makeStyles(({ colors, fonts }, { variant, withIcon }: StyleParams) => ({
  container: {
    backgroundColor: colors.surface,
    height: withIcon ? 64 : 48,
    // Divider
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    /* Unset styles set by TopBar */
    elevation: undefined,
    shadowColor: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    shadowOffset: undefined,
    zIndex: undefined,
  },
  active: {
    color: colors.primary,
  },
  inactive: {
    color: colors.onSurfaceVariant,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    ...fonts.titleSmall,
  },
  indicator: {
    height: variant === 'primary' ? 3 : 2,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  divider: {
    height: 1,
  },
}));
