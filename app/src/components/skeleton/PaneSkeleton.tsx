import { createStyles } from '@theme/styles';
import { Pane } from '#/layout/Pane';
import { Splash } from '#/Splash';

export function PaneSkeleton() {
  return (
    <Pane flex>
      <Splash />
    </Pane>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    marginVertical: 8,
  },
});
