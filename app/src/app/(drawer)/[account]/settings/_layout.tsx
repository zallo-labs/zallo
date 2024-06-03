import { Searchbar } from '#/Appbar/Searchbar';
import { Panes } from '#/layout/Panes';
import { gql } from '@api';
import { Link, Slot, Stack } from 'expo-router';
import { Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '../(home)/_layout';
import { NotFound } from '#/NotFound';
import { createStyles, useStyles } from '@theme/styles';
import { NavigateNextIcon, SearchIcon, TextIcon } from '@theme/icons';
import { ScrollView, View } from 'react-native';
import { AccountApproverItem } from '#/account/AccountApproverItem';
import { ListItem } from '#/list/ListItem';
import { AddCircleIcon } from '#/AddCircleIcon';
import { PolicyItem } from '#/policy/PolicyItem';
import { usePath } from '#/usePath';
import { FirstPane } from '#/layout/FirstPane';
import { useRouteInfo } from 'expo-router/build/hooks';
import { ItemList } from '#/layout/ItemList';
import { AppbarMenu } from '#/Appbar/AppbarMenu';

export default function AccountSettingsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Panes>
        <FirstPane fixed>
          <AccountSettingsPane />
        </FirstPane>

        <Slot />
      </Panes>
    </>
  );
}

const Query = gql(/* GraphQL */ `
  query AccountSettings($account: UAddress!) {
    account(input: { account: $account }) {
      id
      name
      approvers {
        id
        ...AccountApproverItem_Approver
      }
      policies {
        id
        key
        active
        threshold
        approvers {
          id
        }
        draft {
          id
        }
        ...PolicyItem_Policy
      }
    }
  }
`);

export const AccountSettingsParams = AccountParams;

function AccountSettingsPane() {
  const { styles } = useStyles(stylesheet);
  const { account } = useLocalParams(AccountSettingsParams);
  const path = usePath();
  const currentRouteParams = useRouteInfo().params;

  const a = useQuery(Query, { account }).data.account;
  if (!a) return <NotFound name="Account" />;

  const policies = a.policies.sort(
    (a, b) => a.threshold - b.threshold || a.approvers.length - b.approvers.length || a.key - b.key,
  );

  return (
    <ScrollView contentContainerStyle={styles.pane}>
      <Searchbar
        leading={(props) => <AppbarMenu {...props} fallback={SearchIcon} />}
        placeholder={`Search ${a.name}`}
      />

      <ItemList>
        <Link
          href={{
            pathname: '/(drawer)/[account]/settings/details',
            params: { account },
          }}
          asChild
        >
          <ListItem
            leading={TextIcon}
            headline="Details"
            trailing={NavigateNextIcon}
            lines={2}
            containerStyle={styles.item}
            selected={path === '/(drawer)/[account]/settings/details'}
          />
        </Link>
      </ItemList>

      <Text variant="labelLarge" style={styles.subheader}>
        Approvers
      </Text>
      <ItemList>
        {a.approvers.map((a) => (
          <AccountApproverItem key={a.id} approver={a} containerStyle={styles.item} />
        ))}

        <ListItem
          leading={AddCircleIcon}
          headline="Add approver"
          lines={2}
          containerStyle={styles.item}
        />
      </ItemList>

      <Text variant="labelLarge" style={styles.subheader}>
        Policies
      </Text>
      <ItemList>
        {policies.map((p) => (
          <Link
            key={p.id}
            href={{
              pathname: `/(drawer)/[account]/settings/policy/[id]/`,
              params: { account, id: p.id },
            }}
            asChild
          >
            <PolicyItem
              policy={p}
              trailing={({ Text, ...props }) => (
                <View style={styles.trailingContainer}>
                  <Text>
                    {[p.active && 'Active', p.draft && 'Draft'].filter(Boolean).join(' | ')}
                  </Text>
                  <NavigateNextIcon {...props} />
                </View>
              )}
              containerStyle={styles.item}
              selected={
                path.includes('/(drawer)/[account]/settings/policy/[id]') &&
                currentRouteParams.id === p.id
              }
            />
          </Link>
        ))}

        <Link
          href={{
            pathname: `/(drawer)/[account]/settings/policy/[id]/`,
            params: { account, id: 'add' },
          }}
          asChild
        >
          <ListItem
            leading={AddCircleIcon}
            headline="Add policy"
            lines={2}
            containerStyle={styles.item}
            selected={
              path.includes('/(drawer)/[account]/settings/policy/[id]') &&
              currentRouteParams.id === 'add'
            }
          />
        </Link>
      </ItemList>
    </ScrollView>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  pane: {
    gap: 8,
  },
  item: {
    backgroundColor: colors.surface,
  },
  subheader: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}));
