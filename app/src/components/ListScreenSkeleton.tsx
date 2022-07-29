import { Appbar } from 'react-native-paper';
import { CardItemSkeleton } from '~/components2/card/CardItemSkeleton';
import { AppbarBack } from './AppbarBack';
import { Box } from './Box';
import { Container } from './list/Container';
import { LineSkeleton } from './skeleton/LineSkeleton';

export const ListScreenSkeleton = () => {
  return (
    <Box>
      <Appbar.Header>
        <AppbarBack />

        <LineSkeleton width={150} />
      </Appbar.Header>

      <Container mx={3}>
        {[...new Array(3)].map((_, i) => (
          <CardItemSkeleton key={i} my={2} />
        ))}
      </Container>
    </Box>
  );
};
