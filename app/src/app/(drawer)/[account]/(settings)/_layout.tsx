import { Searchbar } from '#/Appbar/Searchbar';
import { Pane } from '#/layout/Pane';
import { Panes } from '#/layout/Panes';
import { gql } from '@api';
import { Link, Slot, Stack } from 'expo-router';
import { Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '../(home)/_layout';
import { NotFound } from '#/NotFound';
import { createStyles, useStyles } from '@theme/styles';
import { NavigateNextIcon, TextIcon } from '@theme/icons';
import { ScrollView, View } from 'react-native';
import { AccountApproverItem } from '#/account/AccountApproverItem';
import { ListItem } from '#/list/ListItem';
import { AddCircleIcon } from '#/AddCircleIcon';
import { PolicyItem } from '#/policy/PolicyItem';
import { usePath } from '#/usePath';

export const unstable_settings = {
  initialRouteName: 'details',
};

export default function AccountSettingsLayout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Panes>
        <AccountSettingsPane />
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

  const a = useQuery(Query, { account }).data.account;
  if (!a) return <NotFound name="Account" />;

  const policies = a.policies.sort(
    (a, b) => a.threshold - b.threshold || a.approvers.length - b.approvers.length || a.key - b.key,
  );

  return (
    <Pane fixed>
      <ScrollView contentContainerStyle={styles.pane}>
        <Searchbar placeholder={`Search ${a.name}`} />

        <View style={styles.list}>
          <Link
            href={{
              pathname: '/(drawer)/[account]/(settings)/details',
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
              selected={path === '/(drawer)/[account]/(settings)/details'}
            />
          </Link>
        </View>

        <Text variant="labelLarge" style={styles.subheader}>
          Approvers
        </Text>
        <View style={styles.list}>
          {a.approvers.map((a) => (
            <AccountApproverItem key={a.id} approver={a} containerStyle={styles.item} />
          ))}

          <ListItem
            leading={AddCircleIcon}
            headline="Add approver"
            lines={2}
            containerStyle={styles.item}
          />
        </View>

        <Text variant="labelLarge" style={styles.subheader}>
          Policies
        </Text>
        <View style={styles.list}>
          {policies.map((p) => (
            <Link
              key={p.id}
              href={{
                pathname: `/(drawer)/[account]/policies/[id]/`,
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
              />
            </Link>
          ))}

          <Link
            href={{
              pathname: `/(drawer)/[account]/policies/[id]/`,
              params: { account, id: 'add' },
            }}
            asChild
          >
            <ListItem
              leading={AddCircleIcon}
              headline="Add policy"
              lines={2}
              containerStyle={styles.item}
            />
          </Link>
        </View>
      </ScrollView>
    </Pane>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
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
  list: {
    overflow: 'hidden',
    gap: 4,
    borderRadius: corner.l,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}));
