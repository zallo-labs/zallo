import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';

export interface ActionsProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
  flex?: boolean;
}

export function Actions({ children, style, horizontal, flex = true }: ActionsProps) {
  const { styles } = useStyles(stylesheet);

  return horizontal ? (
    <View style={[flex && styles.flex, styles.horizontal, style]}>{children}</View>
  ) : (
    <View style={[flex && styles.flex, styles.vertical, style]}>{children}</View>
  );
}

const stylesheet = createStyles(() => ({
  flex: {
    flex: 1,
  },
  horizontal: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    alignItems: {
      compact: 'flex-end',
      extraLarge: 'flex-start',
    },
    gap: 8,
    padding: 16,
  },
  vertical: {
    // alignItems: 'flex-end',
    justifyContent: {
      compact: 'flex-end',
      extraLarge: 'flex-start',
    },
    padding: 16,
    gap: 8,
  },
}));
