import { useImmerAtom } from 'jotai-immer';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import {
  Address,
  ERC20_ABI,
  Selector,
  SPENDING_TRANSFER_FUNCTIONS,
  Target,
  filterFirst,
  isTargetAllowed,
  setTargetAllowed,
} from 'lib';
import { useContractFunctions } from '@api/contracts';
import { Screen } from '~/components/layout/Screen';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { Appbar } from '~/components/Appbar/Appbar';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { SpendingLimit } from './SpendingLimit';
import { ListHeader } from '~/components/list/ListHeader';
import { getFunctionSelector } from 'viem';
import { ContractFunction } from '@api/contracts/types';
import { ScrollView } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { Switch } from 'react-native-paper';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import {
  ContractPermissionsScreenQuery,
  ContractPermissionsScreenQueryVariables,
} from '@api/gen/graphql';
import { ContractPermissionsScreenDocument } from '@api/generated';

gql(/* GraphQL */ `
  query ContractPermissionsScreen($contract: Address!) {
    token(input: { address: $contract }) {
      id
      ...SpendingLimit_token
    }
  }
`);

const ERC20_FUNCTIONS: ContractFunction[] = ERC20_ABI.filter(
  (abi): abi is Extract<typeof abi, { type: 'function' }> => abi.type === 'function',
).map((abi) => ({
  selector: getFunctionSelector(abi) as Selector,
  abi,
}));

export interface ContractPermissionsScreenParams {
  contract: Address;
}

export type ContractPermissionsScreenProps = StackNavigatorScreenProps<'ContractPermissions'>;

export const ContractPermissionsScreen = withSuspense(
  ({ route }: ContractPermissionsScreenProps) => {
    const { contract } = route.params;

    const { token } = useSuspenseQuery<
      ContractPermissionsScreenQuery,
      ContractPermissionsScreenQueryVariables
    >(ContractPermissionsScreenDocument, { variables: { contract } }).data;

    const [{ permissions }, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);

    const target: Target | undefined = permissions.targets.contracts[contract];
    const functions = filterFirst(
      [
        ...useContractFunctions(contract),
        ...(token ? ERC20_FUNCTIONS : []),
        ...Object.keys(target?.functions ?? []).map((selector) => ({
          selector: selector as Selector,
          abi: undefined,
        })),
      ],
      (f) => f.selector,
    ).filter(
      (f) =>
        !f.abi || f.abi.stateMutability === 'payable' || f.abi.stateMutability === 'nonpayable',
    );

    return (
      <Screen>
        <Appbar mode="large" leading="back" headline={useAddressLabel(contract)} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {token && <SpendingLimit token={token} />}

          <ListHeader>Actions</ListHeader>

          <ListItem
            headline="Allow unlisted actions"
            trailing={
              <Switch
                value={target?.defaultAllow ?? permissions.targets.default.defaultAllow}
                onValueChange={(enabled) =>
                  updatePolicy((draft) => {
                    draft.permissions.targets.contracts[contract] = {
                      functions: draft.permissions.targets.contracts[contract]?.functions ?? {},
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
                    value={isTargetAllowed(permissions.targets, contract, f.selector)}
                    onValueChange={(enabled) =>
                      updatePolicy((draft) => {
                        setTargetAllowed(draft.permissions.targets, contract, f.selector, enabled);
                      })
                    }
                  />
                }
              />
            );
          })}
        </ScrollView>
      </Screen>
    );
  },
  ScreenSkeleton,
);
