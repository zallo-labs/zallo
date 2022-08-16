import { Box } from '@components/Box';
import { Container, ContainerProps } from '@components/list/Container';

export const Actions = (props: ContainerProps) => (
  <Container
    vertical
    alignItems="flex-end"
    separator={<Box my={1} />}
    {...props}
  />
);
