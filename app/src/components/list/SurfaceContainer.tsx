import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Box } from '@components/Box';
import { Container, ContainerProps } from './Container';

export type SurfaceContainerProps = ContainerProps;

export const SurfaceContainer = ({
  children,
  ...containerProps
}: SurfaceContainerProps) => {
  const { radius } = useTheme();

  const surface = useMemo(
    () => ({
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    }),
    [radius],
  );

  return (
    <Box surface={surface}>
      <Container {...containerProps}>{children}</Container>
    </Box>
  );
};
