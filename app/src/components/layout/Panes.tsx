import { ReactNode } from 'react';
import { createStyles } from '@theme/styles';
import { View } from 'react-native';
import { ScopeProvider } from 'jotai-scope';
import { atom } from 'jotai';

export const PANES_MOUNTED = atom(0);

export interface PanesProps {
  children: ReactNode;
}

export function Panes({ children }: PanesProps) {
  return (
    <ScopeProvider atoms={[PANES_MOUNTED]}>
      <View style={styles.container}>{children}</View>
    </ScopeProvider>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
    // gap: 24,
  },
});
