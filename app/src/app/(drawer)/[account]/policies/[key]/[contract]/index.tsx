import { useRouter } from 'expo-router';
import { useImmerAtom } from 'jotai-immer';
import {
  ERC20_ABI,
  Selector,
  SPENDING_TRANSFER_FUNCTIONS,
  Target,
  filterFirst,
  isTargetAllowed,
  setTargetAllowed,
} from 'lib';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { ListHeader } from '~/components/list/ListHeader';
import { getFunctionSelector } from 'viem';
import { AbiFunction } from 'abitype';
import { ScrollView, StyleSheet } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { Switch } from 'react-native-paper';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { SpendingLimit } from '~/components/policy/SpendingLimit';
import { PlusIcon } from '@theme/icons';
import { z } from 'zod';
import { zAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

const Query = gql(/* GraphQL */ `
  query ContractPermissionsScreen($contract: Address!) {
    contract(input: { contract: $contract }) {
      id
      functions {
        id
        selector
        abi
      }
    }

    token(input: { address: $contract }) {
      id
      ...SpendingLimit_token
    }
  }
`);

const ERC20_FUNCTIONS = ERC20_ABI.filter(
  (abi): abi is Extract<typeof abi, { type: 'function' }> => abi.type === 'function',
).map((abi) => ({
  selector: getFunctionSelector(abi) as Selector,
  abi,
}));

export const ContractPermissionsScheme = z.object({
  account: zAddress,
  key: z.string(),
  contract: zAddress,
});

function ContractPermissionsScreen() {
  const params = useLocalParams(
    `/(drawer)/[account]/policies/[key]/[contract]/`,
    ContractPermissionsScheme,
  );
  const address = params.account;
  const router = useRouter();
  const { contract, token } = useQuery(Query, { contract: address }).data;

  const [{ permissions }, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);

  const target: Target | undefined = permissions.targets.contracts[address];
  const functions = filterFirst(
    [
      ...(contract?.functions ?? []),
      ...(token ? ERC20_FUNCTIONS : []),
      ...Object.keys(target?.functions ?? []).map((selector) => ({
        selector: selector as Selector,
        abi: undefined,
      })),
    ],
    (f) => f.selector,
  ).filter(
    (f) =>
      !f.abi ||
      (f.abi as AbiFunction).stateMutability === 'payable' ||
      (f.abi as AbiFunction).stateMutability === 'nonpayable',
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppbarOptions
        mode="large"
        headline={useAddressLabel(address)}
        trailing={(props) => (
          <PlusIcon
            {...props}
            onPress={() =>
              router.push({ pathname: `/[account]/policies/[key]/[contract]/add-selector`, params })
            }
          />
        )}
      />

      {token && <SpendingLimit token={token} />}

      <ListHeader>Actions</ListHeader>

      <ListItem
        headline="Allow unlisted actions"
        trailing={
          <Switch
            value={target?.defaultAllow ?? permissions.targets.default.defaultAllow}
            onValueChange={(enabled) =>
              updatePolicy((draft) => {
                draft.permissions.targets.contracts[address] = {
                  functions: draft.permissions.targets.contracts[address]?.functions ?? {},
                  defaultAllow: enabled,
                };
              })
            }
          />
        }
      />

      {functions.map((f) => {
        if (SPENDING_TRANSFER_FUNCTIONS.has(f.selector)) return null; // Handled by SpendingLimit

        return (
          <ListItem
            key={f.selector}
            headline={f.abi?.name ?? f.selector}
            trailing={
              <Switch
                value={isTargetAllowed(permissions.targets, address, f.selector)}
                onValueChange={(enabled) =>
                  updatePolicy((draft) => {
                    setTargetAllowed(draft.permissions.targets, address, f.selector, enabled);
                  })
                }
              />
            }
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});

export default withSuspense(ContractPermissionsScreen, ScreenSkeleton);
