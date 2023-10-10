import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Theme, useTheme } from './paper';
import { LayoutDetails, useLayout } from '~/hooks/useLayout';

type DeviceTheme = Theme & LayoutDetails;

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

export function makeStyles<T extends NamedStyles<T> | NamedStyles<any>, Params = never>(
  styles: T | NamedStyles<T> | ((theme: DeviceTheme, params: Params) => T | NamedStyles<T>),
) {
  return function useStyles(params?: Params): T {
    const theme = useTheme();
    const layout = useLayout();

    return useMemo(() => {
      return typeof styles === 'function'
        ? StyleSheet.create(styles({ ...theme, ...layout }, params!))
        : StyleSheet.create(styles);
    }, [params, theme]);
  };
}
