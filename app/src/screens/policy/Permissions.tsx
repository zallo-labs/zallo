import { AddIcon, NavigateNextIcon } from '@theme/icons';
import { useSelectContract } from '~/components/Contracts/ContractsModal';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { useNavigation } from '@react-navigation/native';
import { POLICY_DRAFT_ATOM } from './PolicyDraft';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Address, isAddress } from 'lib';
import { useImmerAtom } from 'jotai-immer';
import { BasePermissions } from './BasePermissions';

export interface PermissionsProps {}

export const Permissions = (props: PermissionsProps) => {
  const { navigate } = useNavigation();
  const selectContract = useSelectContract();

  const [{ account, permissions }] = useImmerAtom(POLICY_DRAFT_ATOM);

  const contracts = [
    ...Object.keys(permissions.targets.contracts),
    ...Object.keys(permissions.transfers.limits),
  ].filter((contract): contract is Address => isAddress(contract) && contract !== account);

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
          onPress={() => navigate('ContractPermissions', { contract })}
        />
      ))}

      <ListItem
        leading={AddIcon}
        headline="Add contract-specific permssions"
        trailing={NavigateNextIcon}
        onPress={async () =>
          navigate('ContractPermissions', {
            contract: await selectContract({ disabled: [...contracts, account] }),
          })
        }
      />
    </>
  );
};
