import { useEffect } from 'react';
import { z } from 'zod';
import { TopTabs } from '~/components/layout/TopTabs';
import { HomeHeader } from '~/components/home/HomeHeader';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSelectedAccount, useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { zUAddress } from '~/lib/zod';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const InternalParams = z.object({ account: zUAddress().optional() }); // Required as the this route is always first in the history, so may be rendered at any time
export const AccountParams = z.object({ account: zUAddress() });

export default function HomeLayout() {
  const lastSelected = useSelectedAccount();
  const account = useLocalParams(InternalParams).account ?? lastSelected!;
  const setSelectedAccount = useSetSelectedAccont();

  useEffect(() => {
    if (account) setSelectedAccount(account);
  }, [account, setSelectedAccount]);

  return (
    <ScreenSurface>
      <HomeHeader account={account} />

      <TopTabs>
        <TopTabs.Screen name="index" options={{ title: 'Tokens' }} initialParams={{ account }} />
        <TopTabs.Screen
          name="activity"
          options={{ title: 'Activity' }}
          initialParams={{ account }}
        />
      </TopTabs>
    </ScreenSurface>
  );
}
