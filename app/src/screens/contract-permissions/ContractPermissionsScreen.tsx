import { useImmerAtom } from 'jotai-immer';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { Address, ERC20_ABI, Selector, filterFirst, isTargetAllowed, setTargetAllowed } from 'lib';
import { useContractFunctions } from '@api/contracts';
import { Screen } from '~/components/layout/Screen';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { Appbar } from '~/components/Appbar/Appbar';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { SpendingLimit } from './SpendingLimit';
import { ListHeader } from '~/components/list/ListHeader';
import { useMaybeToken } from '@token/useToken';
import { getAbiItem, getFunctionSelector } from 'viem';
import { ContractFunction } from '@api/contracts/types';
import { ScrollView } from 'react-native';
import { ListItem } from '~/components/list/ListItem';
import { Switch } from 'react-native-paper';

const BASIC_FUNCTIONS = {
  // Functions to be handled by TransferPermission, not necessary but simplifies things for the user
  [getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'transfer' }))]: false,
  [getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'approve' }))]: false,
  [getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'increaseAllowance' }))]: false,
  [getFunctionSelector(getAbiItem({ abi: ERC20_ABI, name: 'decreaseAllowance' }))]: false,
};

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
    const isToken = !!useMaybeToken(contract);

    const [policy, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);

    const functions = filterFirst(
      [
        ...useContractFunctions(contract),
        ...(isToken ? ERC20_FUNCTIONS : []),
        ...Object.keys(policy.permissions.targets[contract] ?? []).map((selector) => ({
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

        <ScrollView>
          <SpendingLimit contract={contract} />

          <ListHeader>Actions</ListHeader>

          {functions.map((f) => {
            const name = BASIC_FUNCTIONS[f.selector] ?? f.abi?.name ?? f.selector;
            if (name === false) return null;

            return (
              <ListItem
                key={f.selector}
                headline={name}
                trailing={
                  <Switch
                    value={isTargetAllowed(policy.permissions.targets, contract, f.selector)}
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
