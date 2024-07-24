import { Searchbar } from '#/Appbar/Searchbar';
import { Link } from 'expo-router';
import { Text } from 'react-native-paper';
import { useLocalParams } from '~/hooks/useLocalParams';
import { AccountParams } from '~/app/(nav)/[account]/_layout';
import { createStyles, useStyles } from '@theme/styles';
import { AddIcon, EditOutlineIcon, NavigateNextIcon } from '@theme/icons';
import { ScrollView, View } from 'react-native';
import { AccountApproverItem } from '#/account/AccountApproverItem';
import { ListItem } from '#/list/ListItem';
import { AddCircleIcon } from '#/AddCircleIcon';
import { PolicyItem } from '#/policy/PolicyItem';
import { usePath } from '#/usePath';
import { useRouteInfo, useRouter } from 'expo-router/build/hooks';
import { ItemList } from '#/layout/ItemList';
import { PolicySuggestions } from '#/account/PolicySuggestions';
import { withSuspense } from '#/skeleton/withSuspense';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { PolicyPresetKey } from '~/lib/policy/usePolicyPresets';
import { UPGRADE_APPROVER } from 'lib';
import { MenuOrSearchIcon } from '#/Appbar/MenuOrSearchIcon';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { settings_AccountSettingsQuery } from '~/api/__generated__/settings_AccountSettingsQuery.graphql';
import { UpgradePolicyItem } from '#/account/UpgradePolicyItem';
import { Pane } from '#/layout/Pane';

const Query = graphql`
  query settings_AccountSettingsQuery($account: UAddress!) {
    account(address: $account) @required(action: THROW) {
      id
      chain
      name
      approvers {
        id
        address
        ...AccountApproverItem_approver
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
        ...PolicyItem_policy
      }
      ...PolicySuggestions_account
    }

    user {
      id
      ...PolicySuggestions_user
      ...AccountApproverItem_user
    }
  }
`;

export const AccountSettingsParams = AccountParams;

function AccountSettings() {
  const { styles } = useStyles(stylesheet);
  const { account } = useLocalParams(AccountSettingsParams);
  const router = useRouter();
  const path = usePath();
  const currentRouteParams = useRouteInfo().params;

  const { account: a, user } = useLazyQuery<settings_AccountSettingsQuery>(Query, { account });

  const approvers = a.approvers.filter(
    (approver) => approver.address !== UPGRADE_APPROVER[a.chain],
  );

  const policies = a.policies
    .filter((p) => p.key !== PolicyPresetKey.upgrade)
    .sort((a, b) => a.key - b.key);
  const upgradePolicy = a.policies.find((p) => p.key === PolicyPresetKey.upgrade);

  // TODO: Pane fixed
  return (
    <Pane flex>
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

          {upgradePolicy && (
            <UpgradePolicyItem
              account={account}
              policyKey={upgradePolicy.key}
              containerStyle={styles.item}
            />
          )}

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
    </Pane>
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

export default withSuspense(AccountSettings, <PaneSkeleton />);
