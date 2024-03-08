import { Link, useRouter } from 'expo-router';
import { gql } from '@api/generated';
import { FlashList } from '@shopify/flash-list';
import { NavigateNextIcon } from '@theme/icons';
import { StyleSheet, View } from 'react-native';
import { NotFound } from '#/NotFound';
import { ListHeader } from '#/list/ListHeader';
import { ListItemHeight } from '#/list/ListItem';
import { useQuery } from '~/gql';
import { PolicyItem } from '#/policy/PolicyItem';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { match } from 'ts-pattern';
import { useMutation } from 'urql';
import { AccountParams } from '~/app/(drawer)/[account]/(home)/_layout';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { AccountSettingsSideSheet } from '#/account/AccountSettingsSideSheet';
import { AccountSettingsAppbar } from '#/account/AccountSettingsAppbar';

const Query = gql(/* GraphQL */ `
  query AccountSettingsScreen($account: UAddress!) {
    account(input: { account: $account }) {
      id
      address
      policies {
        __typename
        id
        key
        state {
          id
        }
        draft {
          id
        }
        stateOrDraft {
          id
          threshold
          approvers {
            id
          }
        }
        ...PolicyItem_Policy
      }
      ...AccountSettingsAppbar_Account
      ...AccountSettingsSideSheet_Account
    }

    user {
      id
      primaryAccount {
        id
      }
    }
  }
`);

const UpdateUser = gql(/* GraphQL */ `
  mutation AccountSettingsScreen_UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      primaryAccount {
        id
      }
    }
  }
`);

const AccountSettingsScreenParams = AccountParams;

function AccountSettingsScreen() {
  const params = useLocalParams(AccountSettingsScreenParams);
  const router = useRouter();
  const updateUser = useMutation(UpdateUser)[1];

  const query = useQuery(Query, { account: params.account });
  const { account, user } = query.data;
  const isPrimaryAccount = user.primaryAccount?.id === account?.id;

  if (!account) return query.stale ? null : <NotFound name="Account" />;

  const policies = account.policies.sort(
    (a, b) =>
      a.stateOrDraft.threshold - b.stateOrDraft.threshold ||
      a.stateOrDraft.approvers.length - b.stateOrDraft.approvers.length ||
      a.key - b.key,
  );

  return (
    <SideSheetLayout>
      <AccountSettingsAppbar account={account} />

      <ScrollableScreenSurface>
        <FlashList
          data={['Policies', ...policies]}
          renderItem={({ item }) =>
            match(item)
              .with({ __typename: 'Policy' }, (policy) => (
                <PolicyItem
                  policy={policy}
                  trailing={({ Text, ...props }) => (
                    <View style={styles.trailingContainer}>
                      <Text>
                        {[policy.state && 'Active', policy.draft && 'Draft']
                          .filter(Boolean)
                          .join(' | ')}
                      </Text>
                      <NavigateNextIcon {...props} />
                    </View>
                  )}
                  onPress={() => {
                    router.push({
                      pathname: `/(drawer)/[account]/policies/[key]/`,
                      params: { account: account.address, key: policy.key },
                    });
                  }}
                />
              ))
              .otherwise((header) => <ListHeader>{header}</ListHeader>)
          }
          estimatedItemSize={ListItemHeight.DOUBLE_LINE}
          keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />

        <Actions>
          {!isPrimaryAccount && (
            <Button
              mode="text"
              onPress={() => updateUser({ input: { primaryAccount: account.address } })}
            >
              Set as primary account
            </Button>
          )}

          <Link
            href={{
              pathname: `/(drawer)/[account]/policies/[key]/`,
              params: { account: account.address, key: 'add' },
            }}
            asChild
          >
            <Button mode="contained">Add policy</Button>
          </Link>
        </Actions>
      </ScrollableScreenSurface>

      <AccountSettingsSideSheet account={account} />
    </SideSheetLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default withSuspense(AccountSettingsScreen, ScreenSkeleton);
