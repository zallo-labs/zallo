import { useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { EditIcon, NavigateNextIcon, PlusIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { NotFound } from '~/components/NotFound';
import { Fab } from '~/components/Fab';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItemHeight } from '~/components/list/ListItem';
import { useQuery } from '~/gql';
import { PolicyItem } from '~/components/policy/PolicyItem';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { z } from 'zod';
import { zAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { ScreenSurface } from '~/components/layout/ScreenSurface';

const Query = gql(/* GraphQL */ `
  query PoliciesScreen($account: Address!) {
    account(input: { address: $account }) {
      id
      address
      name
      policies {
        id
        key
        ...PolicyItem_Policy
      }
    }
  }
`);

export const PoliciesScreenParams = z.object({ account: zAddress });
export type PoliciesScreenParams = z.infer<typeof PoliciesScreenParams>;

function PoliciesScreen() {
  const params = useLocalParams(`/(drawer)/[account]/policies/`, PoliciesScreenParams);
  const router = useRouter();

  const { account } = useQuery(Query, { account: params.account }).data;

  if (!account) return <NotFound name="Account" />;

  return (
    <>
      <AppbarOptions
        mode="large"
        leading="menu"
        headline={account.name}
        trailing={(props) => (
          <AppbarMore iconProps={props}>
            {({ close }) => (
              <Menu.Item
                leadingIcon={EditIcon}
                title="Rename"
                onPress={() => {
                  close();
                  router.push({
                    pathname: `/[account]/name`,
                    params: { account: account.address },
                  });
                }}
              />
            )}
          </AppbarMore>
        )}
      />

      <ScreenSurface>
        <FlashList
          data={account.policies}
          ListHeaderComponent={<ListHeader>Security Policies</ListHeader>}
          renderItem={({ item: policy }) => (
            <PolicyItem
              policy={policy}
              trailing={NavigateNextIcon}
              onPress={() => {
                router.push({
                  pathname: `/(drawer)/[account]/policies/[key]/`,
                  params: { account: account.address, key: policy.key },
                });
              }}
            />
          )}
          estimatedItemSize={ListItemHeight.DOUBLE_LINE}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />

        <Fab
          icon={PlusIcon}
          label="Add policy"
          onPress={() =>
            router.push({
              pathname: `/[account]/policies/template`,
              params: { account: account.address },
            })
          }
        />
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
});

export default withSuspense(PoliciesScreen, ScreenSkeleton);
