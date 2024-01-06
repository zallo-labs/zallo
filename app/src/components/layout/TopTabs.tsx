import { ComponentPropsWithoutRef } from 'react';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';

import { TopTabBar } from '~/components/tab/TopTabBar';

const TopTabNavigator = createMaterialTopTabNavigator().Navigator;

const Tabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof TopTabNavigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(createMaterialTopTabNavigator().Navigator);

type TabsProps = ComponentPropsWithoutRef<typeof Tabs>;

export function TopTabs(props: TabsProps) {
  return <Tabs {...props} tabBar={TopTabBar} />;
}

TopTabs.Screen = Tabs.Screen;
