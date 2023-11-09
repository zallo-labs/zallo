import { useEffect } from 'react';
import { z } from 'zod';
import { TopTabs } from '~/components/layout/TopTabs';
import { HomeHeader } from '~/components/home/HomeHeader';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSelectedAccount, useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { zAddress } from '~/lib/zod';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const HomeLayoutParams = z.object({ account: zAddress.optional() });

export default function HomeLayout() {
  const lastSelected = useSelectedAccount();
  const account =
    useLocalParams(`/(drawer)/[account]/(home)/_layout`, HomeLayoutParams).account ?? lastSelected!;
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
