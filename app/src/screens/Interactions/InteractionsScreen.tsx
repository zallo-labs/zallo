import { Address, Selector, asSelector, isAddress } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { POLICY_DRAFT_ATOM } from '../Policy/PolicyDraft';
import { Screen } from '~/components/layout/Screen';
import { ListHeader } from '~/components/list/ListHeader';
import { Button, Divider } from 'react-native-paper';
import { useContractFunctions } from '@api/contracts';
import { useMaybeToken } from '@token/useToken';
import { ERC20_INTERFACE } from '@token/token';
import { FlatList } from 'react-native';
import { StyleSheet } from 'react-native';
import { InteractionItem } from './InteractionItem';
import { AllInteractionsItem } from './AllInteractionsItem';
import { Actions } from '~/components/layout/Actions';
import { useImportSelector } from '~/screens/ImportSelector/ImportSelectorModal';
import { useImmerAtom } from 'jotai-immer';
import { InteractionsAppbar } from './InteractionsAppbar';

export interface InteractionsScreenParams {
  contract: Address | '*';
}

export type InteractionsScreenProps = StackNavigatorScreenProps<'Interactions'>;

export const InteractionsScreen = ({ route: { params } }: InteractionsScreenProps) => {
  const { contract } = params;
  const contractFunctions = useContractFunctions(isAddress(contract) ? contract : undefined);
  const isToken = !!useMaybeToken(isAddress(contract) ? contract : undefined);
  const importSelector = useImportSelector();

  const functions = [
    ...contractFunctions,
    ...(isToken
      ? Object.values(ERC20_INTERFACE.functions).map((f) => ({
          fragment: f,
          selector: asSelector(ERC20_INTERFACE.getSighash(f)),
        }))
      : []),
  ]
    .filter((f) => !f.fragment.constant)
    .map((f) => f.selector);

  const [{ permissions }, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);
  const { targets } = permissions;

  const interactions = new Set([...(targets[contract] ?? []), ...functions]);
  const items = [...interactions].filter((s): s is Selector => s !== '*').sort();

  const addInteraction = async () => {
    const selector = await importSelector();
    updateDraft(({ permissions: { targets } }) => {
      targets[contract] ||= new Set([]);
      targets[contract].add(selector);
    });
  };

  return (
    <Screen>
      <InteractionsAppbar contract={contract} />

      <FlatList
        data={items}
        ListHeaderComponent={
          <>
            <AllInteractionsItem
              contract={contract}
              targets={targets}
              interactions={interactions}
            />

            {items.length > 0 && (
              <>
                <Divider horizontalInset style={styles.divider} />
                <ListHeader>Interactions</ListHeader>
              </>
            )}
          </>
        }
        renderItem={({ item: selector }) => (
          <InteractionItem
            contract={contract}
            selector={selector}
            targets={targets}
            interactions={interactions}
          />
        )}
        ListFooterComponent={
          <Actions>
            <Button mode="contained-tonal" onPress={addInteraction}>
              Add interaction
            </Button>
          </Actions>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flex}
        ListFooterComponentStyle={styles.flex}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  appbarHeadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    marginBottom: 8,
  },
  flex: {
    flexGrow: 1,
  },
});
