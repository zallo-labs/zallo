import { Searchbar } from '#/Appbar/Searchbar';
import { gql } from '@api';
import { Link } from 'expo-router';
import { Text } from 'react-native-paper';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '~/app/(nav)/[account]/_layout';
import { NotFound } from '#/NotFound';
import { createStyles, useStyles } from '@theme/styles';
import { AddIcon, EditOutlineIcon, InfoIcon, NavigateNextIcon, UpdateIcon } from '@theme/icons';
import { ScrollView, View } from 'react-native';
import { AccountApproverItem } from '#/account/AccountApproverItem';
import { ListItem } from '#/list/ListItem';
import { AddCircleIcon } from '#/AddCircleIcon';
import { PolicyItem } from '#/policy/PolicyItem';
import { usePath } from '#/usePath';
import { FirstPane } from '#/layout/FirstPane';
import { useRouteInfo, useRouter } from 'expo-router/build/hooks';
import { ItemList } from '#/layout/ItemList';
import { PolicySuggestions } from '#/account/PolicySuggestions';
import { withSuspense } from '#/skeleton/withSuspense';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { PolicyPresetKey } from '~/lib/policy/usePolicyPresets';
import { UPGRADE_APPROVER } from 'lib';
import { MenuOrSearchIcon } from '#/Appbar/MenuOrSearchIcon';

const Query = gql(/* GraphQL */ `
  query AccountSettings($account: UAddress!) {
    account(input: { account: $account }) {
      id
      chain
      name
      approvers {
        id
        address
        ...AccountApproverItem_Approver
      }
      policies {
        id
        key
        isActive
        isDraft
        threshold
        approvers {
          id
        }
        ...PolicyItem_Policy
      }
      ...PolicySuggestions_Account
    }

    user {
      id
      ...PolicySuggestions_User
      ...AccountApproverItem_User
    }
  }
`);

export const AccountSettingsParams = AccountParams;

function AccountSettingsPane_() {
  const { styles } = useStyles(stylesheet);
  const { account } = useLocalParams(AccountSettingsParams);
  const router = useRouter();
  const path = usePath();
  const currentRouteParams = useRouteInfo().params;

  const query = useQuery(Query, { account });
  const { account: a, user } = query.data;
  if (!a) return query.stale ? null : <NotFound name="Account" />;

  const approvers = a.approvers.filter(
    (approver) => approver.address !== UPGRADE_APPROVER[a.chain],
  );

  const policies = a.policies
    .filter((p) => p.key !== PolicyPresetKey.upgrade)
    .sort((a, b) => a.key - b.key);

  return (
    <FirstPane fixed>
      <ScrollView contentContainerStyle={styles.pane} showsVerticalScrollIndicator={false}>
        <Searchbar
          leading={MenuOrSearchIcon}
          placeholder={`Search ${a.name}`}
          trailing={() => (
            <EditOutlineIcon
              onPress={() =>
                router.push({
                  pathname: '/(nav)/[account]/settings/details',
                  params: { account },
                })
              }
            />
          )}
        />

        <PolicySuggestions account={a} user={user} />

        <Text variant="labelLarge" style={styles.subheader}>
          Approvers
        </Text>
        <ItemList>
          {approvers.map((a) => (
            <AccountApproverItem
              key={a.id}
              account={account}
              approver={a}
              user={user}
              containerStyle={styles.item}
            />
          ))}

          <Link
            href={{ pathname: `/(sheet)/[account]/settings/add-approver`, params: { account } }}
            asChild
          >
            <ListItem
              leading={AddCircleIcon}
              headline="Add approver"
              lines={2}
              containerStyle={styles.item}
            />
          </Link>
        </ItemList>

        <Text variant="labelLarge" style={styles.subheader}>
          Policies
        </Text>
        <ItemList>
          {policies.map((p) => (
            <Link
              key={p.id}
              href={{
                pathname: `/(nav)/[account]/settings/policy/[id]/`,
                params: { account, id: p.id },
              }}
              asChild
            >
              <PolicyItem
                policy={p}
                trailing={({ Text, ...props }) => (
                  <View style={styles.trailingContainer}>
                    <Text>
                      {[p.isActive && 'Active', p.isDraft && 'Draft'].filter(Boolean).join(' | ') ||
                        'Historic'}
                    </Text>
                    <NavigateNextIcon {...props} />
                  </View>
                )}
                containerStyle={styles.item}
                selected={
                  path.includes('/(nav)/[account]/settings/policy/[id]') &&
                  currentRouteParams.id === p.id
                }
              />
            </Link>
          ))}

          {/* TODO: link to upgrade policy docs */}
          <ListItem
            leading={UpdateIcon}
            headline="Upgrade"
            supporting="Learn more - coming soon"
            trailing={InfoIcon}
            containerStyle={styles.item}
            disabled
          />

          <Link
            href={{
              pathname: `/(nav)/[account]/settings/policy/[id]/`,
              params: { account, id: 'add' },
            }}
            asChild
          >
            <ListItem
              leading={AddIcon}
              headline="Add policy"
              lines={2}
              containerStyle={styles.item}
              selected={
                path.includes('/(nav)/[account]/settings/policy/[id]') &&
                currentRouteParams.id === 'add'
              }
            />
          </Link>
        </ItemList>
      </ScrollView>
    </FirstPane>
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

export const AccountSettingsPane = withSuspense(AccountSettingsPane_, <PaneSkeleton />);

export default function AccountSettings() {
  return null;
}
