import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { Screen } from '../layout/Screen';

export interface ScreenSkeletonProps {
  children?: ReactNode;
  mode?: AppbarHeaderProps['mode'];
}

export const ScreenSkeleton = ({ children, mode }: ScreenSkeletonProps) => (
  <Screen>
    <Appbar.Header mode={mode}>
      <AppbarBack />
    </Appbar.Header>

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
