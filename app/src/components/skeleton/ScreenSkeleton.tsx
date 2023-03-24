import { ReactNode } from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { MenuIcon } from '~/util/theme/icons';
import { LineSkeleton } from './LineSkeleton';

export interface ScreenSkeletonProps {
  children?: ReactNode;
  mode?: AppbarHeaderProps['mode'];
  menu?: boolean;
  title?: boolean;
}

export const ScreenSkeleton = ({ children, mode, menu, title = true }: ScreenSkeletonProps) => (
  <View>
    <Appbar.Header mode={mode}>
      {menu ? <Appbar.Action icon={MenuIcon} /> : <AppbarBack />}

      {title && <Appbar.Content title={<LineSkeleton width={150} />} />}
    </Appbar.Header>

    {children}
  </View>
);
