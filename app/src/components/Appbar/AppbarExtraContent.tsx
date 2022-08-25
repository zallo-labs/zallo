import { ReactNode } from 'react';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';

export interface AppbarExtraContentProps {
  children: ReactNode;
}

export const AppbarExtraContent = ({ children }: AppbarExtraContentProps) => (
  <Container
    flex={1}
    horizontal
    justifyContent="flex-end"
    alignItems="center"
    mr={2}
    separator={<Box mx={2} />}
  >
    {children}
  </Container>
);
