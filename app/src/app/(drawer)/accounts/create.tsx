import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { CreateAccount } from '#/CreateAccount';

function CreateAccountScreen() {
  return (
    <>
      <AppbarOptions mode="large" headline="Let's setup your account" />

      <ScrollableScreenSurface>
        <CreateAccount />
      </ScrollableScreenSurface>
    </>
  );
}

export default withSuspense(CreateAccountScreen, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
