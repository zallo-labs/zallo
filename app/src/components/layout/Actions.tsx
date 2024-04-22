import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ActionsProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}

export function Actions({ children, style, flex = true }: ActionsProps) {
  const { styles } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container(flex), style]}>
      <View style={styles.content(insets)}>{children}</View>
    </View>
  );
}

const stylesheet = createStyles(() => ({
  container: (flex: boolean) => ({
    ...(flex && { flexGrow: 1 }),
    justifyContent: 'flex-end',
  }),
  content: (insets: EdgeInsets) => ({
    alignItems: 'stretch',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16 + insets.bottom,
  }),
}));
