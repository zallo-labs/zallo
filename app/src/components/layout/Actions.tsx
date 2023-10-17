import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { makeStyles } from '@theme/makeStyles';

export interface ActionsProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}

export function Actions({ children, style, flex = true }: ActionsProps) {
  const styles = useStyles(flex);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles(({ insets }, flex: boolean) => ({
  container: {
    ...(flex && { flexGrow: 1 }),
    justifyContent: 'flex-end',
  },
  content: {
    alignItems: 'stretch',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16 + insets.bottom,
  },
}));
