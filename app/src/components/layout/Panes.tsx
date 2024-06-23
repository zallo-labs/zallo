import { ReactNode } from 'react';
import { createStyles } from '@theme/styles';
import { View } from 'react-native';
import { getNavType } from '#/drawer/DrawerContextProvider';
import { UnistylesBreakpoints } from 'react-native-unistyles';

export interface PanesProps {
  children: ReactNode;
}

export function Panes({ children }: PanesProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
});

const PADDING = { compact: 16, medium: 24 } as const;

export function getPanesPadding(breakpoint: keyof UnistylesBreakpoints) {
  const type = getNavType(breakpoint);

  return {
    paddingLeft: type === 'modal' ? PADDING : {},
    paddingRight: PADDING,
  } as const;
}

const WITHOUT_PADDING = { compact: -PADDING.compact, medium: -PADDING.medium } as const;

export function getNegativePanesMargin(breakpoint: keyof UnistylesBreakpoints) {
  const type = getNavType(breakpoint);

  return {
    marginLeft: type === 'modal' ? WITHOUT_PADDING : {},
    marginRight: WITHOUT_PADDING,
  };
}
