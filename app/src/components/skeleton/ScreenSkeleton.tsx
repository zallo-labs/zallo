import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import { ReactNode } from 'react';
import { Appbar } from 'react-native-paper';
import { LineSkeleton } from './LineSkeleton';

export interface ScreenSkeletonProps {
  children?: ReactNode;
}

export const ScreenSkeleton = ({ children }: ScreenSkeletonProps) => (
  <Box>
    <Appbar.Header>
      <AppbarBack />

      <LineSkeleton width={150} />
    </Appbar.Header>

    {children}
  </Box>
);
