import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Screen } from '../layout/Screen';
import { Appbar, AppbarProps } from '../Appbar/Appbar';

export interface ScreenSkeletonProps {
  children?: ReactNode;
  mode?: AppbarProps['mode'];
}

export const ScreenSkeleton = ({ children, mode }: ScreenSkeletonProps) => (
  <Screen>
    <Appbar leading="back" mode={mode ?? 'large'} headline="" />

    {children || (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator />
      </View>
    )}
  </Screen>
);

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
