import { AppbarBack } from './AppbarBack';
import { AppbarRoot } from './AppbarRoot';
import { Box } from './Box';
import { Container } from './list/Container';
import { ItemSkeleton } from './list/ItemSkeleton';
import { LineSkeleton } from './skeleton/LineSkeleton';

export const GenericListScreenSkeleton = () => {
  return (
    <Box>
      <AppbarRoot>
        <AppbarBack />

        <LineSkeleton width={150} />
      </AppbarRoot>

      <Container>
        {[...new Array(3)].map((_, i) => (
          <ItemSkeleton key={i} my={2} mx={3} />
        ))}
      </Container>
    </Box>
  );
};
