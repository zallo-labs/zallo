import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { ListItemSkeleton, ListItemSkeletonProps } from '../list/ListItemSkeleton';

export interface TabScreenSkeletonProps {
  children?: ReactNode;
  listItems?: ListItemSkeletonProps;
}

export const TabScreenSkeleton = ({ children, listItems }: TabScreenSkeletonProps) => (
  <View style={styles.container}>
    {children ||
      (listItems && (
        <>
          <ListItemSkeleton {...listItems} />
          <ListItemSkeleton {...listItems} />
          <ListItemSkeleton {...listItems} />
        </>
      )) || (
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
