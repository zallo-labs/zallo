import { createStyles } from '@theme/styles';
import { ReactNode } from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';

export interface OnboardMainPaneProps extends ScrollViewProps {
  children: ReactNode;
}

export function OnboardMainPane(props: OnboardMainPaneProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        {...props}
        style={[styles.pane, props.style]}
        contentContainerStyle={[styles.paneContainer, props.contentContainerStyle]}
      />
    </View>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pane: {
    flex: 1,
    maxWidth: 600,
  },
  paneContainer: {
    flexGrow: 1,
  },
});
