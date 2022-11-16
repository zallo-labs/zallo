import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { MenuIcon } from '~/util/theme/icons';
import { ReactNode } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { LineSkeleton } from './LineSkeleton';

export interface ScreenSkeletonProps {
  children?: ReactNode;
  mode?: AppbarHeaderProps['mode'];
  menu?: boolean;
  title?: boolean;
}

export const ScreenSkeleton = ({ children, mode, menu, title = true }: ScreenSkeletonProps) => (
  <Box>
    <Appbar.Header mode={mode}>
      {menu ? <Appbar.Action icon={MenuIcon} /> : <AppbarBack />}

      {title && <Appbar.Content title={<LineSkeleton width={150} />} />}
    </Appbar.Header>

    {children}
  </Box>
);
