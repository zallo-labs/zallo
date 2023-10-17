import { AddIcon, NavigateNextIcon } from '@theme/icons';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Address, PolicyKey, isAddress } from 'lib';
import { useImmerAtom } from 'jotai-immer';
import { BasePermissions } from './BasePermissions';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { useRouter } from 'expo-router';
import { useSelectAddress } from '~/hooks/useSelectAddress';

export interface PermissionsProps {
  account: Address;
  policyKey: PolicyKey | 'add';
}

export function Permissions(props: PermissionsProps) {
  const router = useRouter();
  const selectAddress = useSelectAddress();

  const [{ account, permissions }] = useImmerAtom(POLICY_DRAFT_ATOM);

  const contracts = [
    ...Object.keys(permissions.targets.contracts),
    ...Object.keys(permissions.transfers.limits),
  ].filter((contract): contract is Address => isAddress(contract) && contract !== account);

  const pushContractScreen = (contract: Address) =>
    router.push({
      pathname: `/(drawer)/[account]/policies/[key]/[contract]/`,
      params: { account: props.account, key: props.policyKey, contract },
    });

  return (
    <>
      <ListHeader>Permissions</ListHeader>

      <BasePermissions />

      {contracts.map((contract) => (
        <ListItem
          key={contract}
          leading={contract}
          leadingSize="small"
          headline={<AddressLabel address={contract} />}
          trailing={NavigateNextIcon}
          onPress={() => pushContractScreen(contract)}
        />
      ))}

      <ListItem
        leading={AddIcon}
        headline="Add permssions for contract"
        trailing={NavigateNextIcon}
        onPress={async () =>
          pushContractScreen(
            await selectAddress({
              include: ['accounts', 'tokens', 'contacts'],
              disabled: [...contracts, account],
            }),
          )
        }
      />
    </>
  );
}
