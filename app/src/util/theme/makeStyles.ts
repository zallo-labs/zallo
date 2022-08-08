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
  return function useStyles(params?: Params): T {
    const theme = useTheme();

    return useMemo(() => {
      return typeof styles === 'function'
        ? StyleSheet.create(styles(theme, params!))
        : StyleSheet.create(styles);
    }, [styles, params, theme]);
  };
}
