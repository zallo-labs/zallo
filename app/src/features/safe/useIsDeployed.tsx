import { useEffect, useState } from 'react';
import { useSafe } from './SafeProvider';

export const useIsDeployed = () => {
  const { safe } = useSafe();

  const [isDeployed, setIsDeployed] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    (async () => {
      setIsDeployed((await safe.provider.getCode(safe.address)) !== '0x');
    })();
  }, [safe]);

  return isDeployed;
};
