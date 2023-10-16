import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { TopTabs } from '~/components/TopTabs';
import { HomeHeader } from '~/components/home/HomeHeader';
import { useLocalParams } from '~/hooks/useLocalParams';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';
import { zAddress } from '~/lib/zod';

const HomeLayoutParams = z.object({ account: zAddress });

export default function HomeLayout() {
  const { account } = useLocalParams(`/(drawer)/[account]/(home)/_layout`, HomeLayoutParams);
  const setSelectedAccount = useSetSelectedAccont();

  useEffect(() => {
    if (account) setSelectedAccount(account);
  }, [account]);

  return (
    <View style={styles.root}>
      <HomeHeader account={account} />

      <TopTabs>
        <TopTabs.Screen name="index" options={{ title: 'Tokens' }} initialParams={{ account }} />
        <TopTabs.Screen
          name="activity"
          options={{ title: 'Activity' }}
          initialParams={{ account }}
        />
      </TopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
