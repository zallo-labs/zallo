import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Box } from '@components/Box';
import { Container, ContainerProps } from './Container';

export type SurfaceContainerProps = ContainerProps;

export const SurfaceContainer = ({
  children,
  ...containerProps
}: SurfaceContainerProps) => {
  const { radii } = useTheme();

  const surface = useMemo(
    () => ({
      borderTopLeftRadius: radii[1],
      borderTopRightRadius: radii[1],
      borderBottomLeftRadius: radii[1],
      borderBottomRightRadius: radii[1],
    }),
    [radii],
  );

  return (
    <Box surface={surface}>
      <Container {...containerProps}>{children}</Container>
    </Box>
  );
};
