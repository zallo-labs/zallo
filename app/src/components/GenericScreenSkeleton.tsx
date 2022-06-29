import { Appbar } from 'react-native-paper';
import { AppbarBack } from './AppbarBack';
import { Box } from './Box';
import { Container } from './list/Container';
import { ItemSkeleton } from './list/ItemSkeleton';
import { LineSkeleton } from './skeleton/LineSkeleton';

export const GenericListScreenSkeleton = () => {
  return (
    <Box>
      <Appbar.Header>
        <AppbarBack />

        <LineSkeleton width={150} />
      </Appbar.Header>

      <Container>
        {[...new Array(3)].map((_, i) => (
          <ItemSkeleton key={i} my={2} mx={3} />
        ))}
      </Container>
    </Box>
  );
};
