import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type Theme = ReturnType<typeof useTheme>;

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
// type Styles = Parameters<typeof StyleSheet.create>[0];

type Params<T> = T | NamedStyles<T> | ((theme: Theme) => T | NamedStyles<T>);

export const makeStyles =
  <T extends NamedStyles<T> | NamedStyles<any>>(styles: Params<T>) =>
  () => {
    const theme = useTheme();
    if (typeof styles === 'function') styles = styles(theme);

    return StyleSheet.create(styles);
  };
