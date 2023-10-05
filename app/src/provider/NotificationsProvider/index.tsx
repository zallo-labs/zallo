import { NotificationsRegistrar } from './NotificationsRegistrar';
import { NotificationsRouter } from './NotificationsRouter';

export function NotificationsProvider() {
  return (
    <>
      <NotificationsRegistrar />
      <NotificationsRouter />
    </>
  );
}
