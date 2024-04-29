import { Theme } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

type ContainerLevel = keyof Theme['colors']['surfaceContainer'];

export interface ContainerProps {
  children: ReactNode;
  level: ContainerLevel;
  style?: StyleProp<ViewStyle>;
}

export function Container({ children, level, style }: ContainerProps) {
  const { styles } = useStyles(stylesheet);

  return <View style={[styles.container(level), style]}>{children}</View>;
}

const stylesheet = createStyles(({ colors }) => ({
  container: (level: ContainerLevel) => ({
    backgroundColor: colors.surfaceContainer[level],
  }),
}));
