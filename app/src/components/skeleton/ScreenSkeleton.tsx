import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { Screen } from '../layout/Screen';
import { LineSkeleton } from './LineSkeleton';

export interface ScreenSkeletonProps {
  children?: ReactNode;
  mode?: AppbarHeaderProps['mode'];
  title?: boolean;
}

export const ScreenSkeleton = ({ children, mode, title = true }: ScreenSkeletonProps) => (
  <Screen withoutTopInset>
    <Appbar.Header mode={mode}>
      <AppbarBack />

      {title && <Appbar.Content title={<LineSkeleton width={150} />} />}
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
