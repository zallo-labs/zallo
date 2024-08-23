import { createPanesNavigator } from '#/layout/PanesNavigator';

const Panes = createPanesNavigator();

export default function TokensLayout() {
  return <Panes />;
}

export { ErrorBoundary } from '#/ErrorBoundary';
