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
    <View style={[styles.hContainer, style]}>{children}</View>
  ) : (
    <View style={[styles.vContainer(flex), style]}>
      <View style={styles.vContent}>{children}</View>
    </View>
  );
}

const stylesheet = createStyles(() => ({
  hContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  vContainer: (flex: boolean) => ({
    ...(flex && { flexGrow: 1 }),
    justifyContent: 'flex-end',
  }),
  vContent: {
    alignItems: 'stretch',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
}));
