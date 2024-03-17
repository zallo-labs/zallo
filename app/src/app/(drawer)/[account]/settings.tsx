import { Link } from 'expo-router';
import { gql } from '@api/generated';
import { StyleSheet } from 'react-native';
import { NotFound } from '#/NotFound';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { useMutation } from 'urql';
import { AccountParams } from '~/app/(drawer)/[account]/(home)/_layout';
import { SideSheetLayout } from '#/SideSheet/SideSheetLayout';
import { AccountSettingsSideSheet } from '#/account/AccountSettingsSideSheet';
import { AccountSettingsAppbar } from '#/account/AccountSettingsAppbar';
import { PolicySuggestions } from '#/account/PolicySuggestions';
import { AccountPolicies } from '#/account/AccountPolicies';

const Query = gql(/* GraphQL */ `
  query AccountSettingsScreen($account: UAddress!) {
    account(input: { account: $account }) {
      id
      address
      ...AccountSettingsAppbar_Account
      ...PolicySuggestions_Account
      ...AccountPolicies_Account
      ...AccountSettingsSideSheet_Account
    }

    user {
      id
      primaryAccount {
        id
      }
      ...PolicySuggestions_User
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
  const updateUser = useMutation(UpdateUser)[1];

  const query = useQuery(Query, { account: params.account });
  const { account, user } = query.data;
  const isPrimaryAccount = user.primaryAccount?.id === account?.id;

  if (!account) return query.stale ? null : <NotFound name="Account" />;

  return (
    <SideSheetLayout>
      <AccountSettingsAppbar account={account} />

      <ScrollableScreenSurface contentContainerStyle={styles.content}>
        <PolicySuggestions account={account} user={user} />
        <AccountPolicies account={account} />

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
              pathname: `/(drawer)/[account]/policies/[id]/`,
              params: { account: account.address, id: 'add' },
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
  content: {
    paddingVertical: 8,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default withSuspense(AccountSettingsScreen, ScreenSkeleton);
