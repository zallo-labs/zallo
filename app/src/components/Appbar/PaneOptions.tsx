import { PaneProps } from '#/layout/Pane';
import { PanesNavigationOptions } from '#/layout/PanesNavigator';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export type PaneOptionsProps = PaneProps;

export function PaneOptions(options: PaneOptionsProps) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ pane: options } satisfies Partial<PanesNavigationOptions>);
  }, [navigation, options]);

  return null;
}
