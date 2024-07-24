import { createPanesNavigator } from '#/layout/PanesNavigator';

const Panes = createPanesNavigator();

export default function HomeLayout() {
  return <Panes />;
}

export { ErrorBoundary } from '#/ErrorBoundary';
