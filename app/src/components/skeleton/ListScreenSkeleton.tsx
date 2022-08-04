import { CardItemSkeleton } from '~/components2/card/CardItemSkeleton';
import { Container } from '../list/Container';
import { ScreenSkeleton } from './ScreenSkeleton';

export const ListScreenSkeleton = () => (
  <ScreenSkeleton>
    <Container mx={3}>
      {[...new Array(3)].map((_, i) => (
        <CardItemSkeleton key={i} my={2} />
      ))}
    </Container>
  </ScreenSkeleton>
);
