import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ThemeOverride, useTheme } from './paper';

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function makeStyles<
  T extends NamedStyles<T> | NamedStyles<any>,
  Params = never,
>(
  styles:
    | T
    | NamedStyles<T>
    | ((theme: ThemeOverride, params: Params) => T | NamedStyles<T>),
) {
  return function useStyles(params: Params): T {
    const theme = useTheme();

    return useMemo(() => {
      if (typeof styles === 'function') styles = styles(theme, params);

      return StyleSheet.create(styles as T | NamedStyles<T>);
    }, [params, theme]);
  };
}
