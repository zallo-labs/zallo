import { createStyles } from '@theme/styles';
import { FC, ReactNode } from 'react';
import { View } from 'react-native';

export interface RailLayoutProps {
  children: ReactNode;
  Rail: FC;
}

export function RailLayout({ children, Rail }: RailLayoutProps) {
  return (
    <View style={styles.container}>
      <View>
        <Rail />
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
