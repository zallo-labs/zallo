import { FunctionOutlineIcon, NavigateNextIcon } from '@theme/icons';
import { useSelectContract } from '~/components/Contracts/ContractsModal';
import { ListHeader } from '~/components/list/ListHeader';
import { ListHeaderButton } from '~/components/list/ListHeaderButton';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { useNavigation } from '@react-navigation/native';
import { POLICY_DRAFT_ATOM } from './PolicyDraft';
import { AddressLabel } from '~/components/address/AddressLabel';
import { Address, Selector, ZERO_ADDR, isAddress } from 'lib';
import { match } from 'ts-pattern';
import { useImmerAtom } from 'jotai-immer';
import { FunctionLabel } from '~/components/call/FunctionLabel';

const getSelectorDetails = (
  contract: Address,
  selectors: Set<Selector | '*'>,
): ListItemProps['supporting'] =>
  match(selectors)
    .with(new Set(['*']), () => 'All interactions')
    .when(
      (s) => s.size === 0,
      () => 'No interactions',
    )
    .otherwise(() => ({ Text }) => (
      <Text>
        {[...selectors].map((selector, i) => (
          <>
            <FunctionLabel contract={contract} selector={selector as Selector} />
            {i < selectors.size - 1 && ', '}
          </>
        ))}
      </Text>
    ));

export interface PermissionsProps {}

export const Permissions = (props: PermissionsProps) => {
  const { navigate } = useNavigation();
  const selectContract = useSelectContract();

  const [
    {
      account,
      permissions: { targets },
    },
    updateDraft,
  ] = useImmerAtom(POLICY_DRAFT_ATOM);

  const items = new Set([account, ...Object.keys(targets)].filter(isAddress));

  const add = async () => {
    const contract = await selectContract({ disabled: items });
    updateDraft((draft) => {
      draft.permissions.targets[contract] = new Set(['*']);
    });
    navigate('Interactions', { contract });
  };

  return (
    <>
      <ListHeader trailing={<ListHeaderButton onPress={add}>Add</ListHeaderButton>}>
        Permissions
      </ListHeader>

      {[...items].map((contract) => (
        <ListItem
          key={contract}
          leading={contract}
          headline={<AddressLabel address={contract} />}
          supporting={getSelectorDetails(contract, targets[contract] ?? targets['*'])}
          trailing={NavigateNextIcon}
          onPress={() => navigate('Interactions', { contract })}
        />
      ))}

      <ListItem
        leading={FunctionOutlineIcon}
        avatarLeadingSize
        headline="Contracts not listed"
        supporting={getSelectorDetails(ZERO_ADDR, targets['*'])}
        trailing={NavigateNextIcon}
        onPress={() => navigate('Interactions', { contract: '*' })}
      />
    </>
  );
};
