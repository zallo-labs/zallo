import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export interface TabScreenSkeletonProps {
  children?: ReactNode;
}

export const TabScreenSkeleton = ({ children }: TabScreenSkeletonProps) => (
  <View style={styles.container}>
    {children || (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
