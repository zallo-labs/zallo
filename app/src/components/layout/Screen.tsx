import { makeStyles } from '@theme/makeStyles';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  safeArea?: 'full' | 'withoutTop' | 'withoutBottom' | 'withoutVertical';
}

export const Screen = ({ children, style, safeArea }: ScreenProps) => {
  const styles = useStyles(useSafeAreaInsets());

  const safeAreaStyle = styles[safeArea || 'full'];

  return <View style={[styles.container, styles.sides, safeAreaStyle, style]}>{children}</View>;
};

const useStyles = makeStyles((_theme, { top, bottom, left, right }: EdgeInsets) => ({
  container: {
    flex: 1,
  },
  sides: {
    paddingLeft: left,
    paddingRight: right,
  },
  full: {
    paddingTop: top,
    paddingBottom: bottom,
  },
  withoutTop: {
    paddingBottom: bottom,
  },
  withoutBottom: {
    paddingTop: top,
  },
  withoutVertical: {},
}));
