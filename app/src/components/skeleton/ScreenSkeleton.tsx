import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { MenuIcon } from '@util/theme/icons';
import { ReactNode } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components2/Appbar/useAppbarHeader';
import { LineSkeleton } from './LineSkeleton';

export interface ScreenSkeletonProps {
  children?: ReactNode;
  mode?: AppbarHeaderProps['mode'];
  menu?: boolean;
}

export const ScreenSkeleton = ({
  children,
  mode,
  menu,
}: ScreenSkeletonProps) => (
  <Box>
    <Appbar.Header mode={mode}>
      {menu ? <Appbar.Action icon={MenuIcon} /> : <AppbarBack />}

      <Appbar.Content title={<LineSkeleton width={150} />} />
    </Appbar.Header>

    {children}
  </Box>
);
