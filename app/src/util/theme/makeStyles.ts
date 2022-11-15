import { useMemo } from 'react';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ScaledSize,
  useWindowDimensions,
} from 'react-native';
import { ThemeOverride, useTheme } from './paper';

type InjectedTheme = ThemeOverride & {
  window: ScaledSize;
};

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function makeStyles<T extends NamedStyles<T> | NamedStyles<any>, Params = never>(
  styles: T | NamedStyles<T> | ((theme: InjectedTheme, params: Params) => T | NamedStyles<T>),
) {
  return function useStyles(params?: Params): T {
    const theme = useTheme();
    const window = useWindowDimensions();

    return useMemo(() => {
      return typeof styles === 'function'
        ? StyleSheet.create(styles({ ...theme, window }, params!))
        : StyleSheet.create(styles);
    }, [styles, params, theme, window]);
  };
}
