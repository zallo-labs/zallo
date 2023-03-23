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
  withoutTopInset?: boolean;
  isModal?: boolean;
}

const useStyles = makeStyles((_theme, { insets, withoutTopInset, isModal }: Style) => ({
  container: {
    flex: 1,
    ...(!withoutTopInset && { paddingTop: insets.top }),
    ...(isModal && { paddingTop: 16 }),
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  },
}));
