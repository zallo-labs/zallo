import { useMemo } from 'react';
import { StyleSheet, ScaledSize, useWindowDimensions } from 'react-native';
import { Theme, useTheme } from './paper';

type InjectedTheme = Theme & {
  window: ScaledSize;
};

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

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
    }, [params, theme, window]);
  };
}
