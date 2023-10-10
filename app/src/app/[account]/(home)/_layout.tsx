import { SearchParams, useLocalSearchParams } from 'expo-router';
import { asAddress } from 'lib';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { TopTabs } from '~/components/TopTabs';
import { HomeHeader } from '~/components/home/HomeHeader';
import { useSetSelectedAccont } from '~/hooks/useSelectedAccount';

export const unstable_settings = {
  initialRouteName: 'index',
};

type Params = SearchParams<`/[account]/(home)/_layout`>;

export default function HomeLayout() {
  const account = asAddress(useLocalSearchParams<Params>().account);
  const setSelectedAccount = useSetSelectedAccont();

  useEffect(() => setSelectedAccount(account), [account]);

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
