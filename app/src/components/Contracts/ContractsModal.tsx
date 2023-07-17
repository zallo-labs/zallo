import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Appbar } from '../Appbar/Appbar';
import { Screen } from '../layout/Screen';
import { useTokens } from '@token/useToken';
import { Address } from 'lib';
import { FlashList } from '@shopify/flash-list';
import { ListItem, ListItemHeight } from '../list/ListItem';
import { P, match } from 'ts-pattern';
import { ListHeader } from '../list/ListHeader';
import { AddressLabel } from '../address/AddressLabel';
import { NavigateNextIcon } from '@theme/icons';
import { truncateAddr } from '~/util/format';
import { EventEmitter } from '~/util/EventEmitter';

export const CONTRACT_EMITTER = new EventEmitter<Address>('Contract');
export const useSelectContract = CONTRACT_EMITTER.createUseSelect('ContractsModal');

export interface ContractsModalParams {
  disabled?: Address[];
}

export type ContractsModalProps = StackNavigatorScreenProps<'ContractsModal'>;

export const ContractsModal = ({ route, navigation: { goBack } }: ContractsModalProps) => {
  const disabled = route.params.disabled && new Set(route.params.disabled);
  const tokens = useTokens();

  return (
    <Screen>
      <Appbar mode="small" inset={false} leading="close" headline="Contracts" />

      <FlashList
        data={['Tokens', ...tokens]}
        renderItem={({ item }) =>
          match(item)
            .with(P.string, (s) => <ListHeader>{s}</ListHeader>)
            .otherwise(({ address }) => (
              <ListItem
                leading={address}
                headline={<AddressLabel address={address} />}
                supporting={truncateAddr(address)}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(address)}
                onPress={() => CONTRACT_EMITTER.emit(address)}
              />
            ))
        }
        getItemType={(item) =>
          match(item)
            .with(P.string, () => 'header')
            .otherwise(() => 'item')
        }
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};
