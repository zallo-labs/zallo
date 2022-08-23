import { Box } from '~/components/layout/Box';
import { Container, ContainerProps } from '~/components/layout/Container';

export const Actions = (props: ContainerProps) => (
  <Container
    vertical
    alignItems="flex-end"
    separator={<Box my={1} />}
    {...props}
  />
);
