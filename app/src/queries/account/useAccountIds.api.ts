import { useMemo } from 'react';
import { useUserIds } from '../user/useUserIds.api';

export const useAccountIds = () => {
  const [users, rest] = useUserIds();

  const ids = useMemo(() => users.map((user) => user.account), [users]);

  return [ids, rest] as const;
};
