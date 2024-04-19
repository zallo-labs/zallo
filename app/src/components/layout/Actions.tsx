import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';

export interface ActionsProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}

export function Actions({ children, style, flex = true }: ActionsProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={[styles.container(flex), style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const stylesheet = createStyles((_theme, { insets }) => ({
  container: (flex: boolean) => ({
    ...(flex && { flexGrow: 1 }),
    justifyContent: 'flex-end',
  }),
  content: {
    alignItems: 'stretch',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16 + insets.bottom,
  },
}));
