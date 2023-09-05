import { makeStyles } from '@theme/makeStyles';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenProps extends Omit<Style, 'insets'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Screen = ({ children, style, ...styleParams }: ScreenProps) => {
  const styles = useStyles({ insets: useSafeAreaInsets(), ...styleParams });

  return <View style={[styles.container, style]}>{children}</View>;
};

interface Style {
  insets: EdgeInsets;
  topInset?: boolean;
  bottomInset?: boolean;
}

const useStyles = makeStyles((_theme, { insets, topInset, bottomInset = true }: Style) => ({
  container: {
    flex: 1,
    ...(topInset && { paddingTop: insets.top }),
    ...(bottomInset && { paddingBottom: insets.bottom }),
    paddingLeft: insets.left,
    paddingRight: insets.right,
  },
}));
