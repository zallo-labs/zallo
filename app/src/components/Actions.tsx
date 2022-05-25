import { ChildrenProps } from '@util/children';
import { ActionsSpaceFooter } from './ActionsSpaceFooter';
import { Box } from './Box';
import { Container } from './list/Container';

export interface ActionsProps extends ChildrenProps {
  space?: boolean;
}

export const Actions = ({ children, space }: ActionsProps) => {
  return (
    <>
      {space && <ActionsSpaceFooter />}

      <Container
        horizontal
        justifyContent="flex-end"
        alignItems="center"
        style={{ position: 'absolute', right: 0, bottom: 0 }}
        margin={4}
        separator={<Box mx={2} />}
      >
        {children}
      </Container>
    </>
  );
};
