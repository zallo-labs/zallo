import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Appbar } from '../Appbar/Appbar';
import { Screen } from '../layout/Screen';
import { Address } from 'lib';
import { FlashList } from '@shopify/flash-list';
import { ListItem, ListItemHeight } from '../list/ListItem';
import { P, match } from 'ts-pattern';
import { ListHeader } from '../list/ListHeader';
import { NavigateNextIcon } from '@theme/icons';
import { truncateAddr } from '~/util/format';
import { EventEmitter } from '~/util/EventEmitter';
import { gql } from '@api/generated';
import { TokenIcon } from '../token/TokenIcon/TokenIcon';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query ContractsModal {
    tokens {
      __typename
      id
      address
      name
      ...TokenIcon_token
    }
  }
`);

export const CONTRACT_EMITTER = new EventEmitter<Address>('Contract');
export const useSelectContract = CONTRACT_EMITTER.createUseSelect('ContractsModal');

export interface ContractsModalParams {
  disabled?: Address[];
}

export type ContractsModalProps = StackNavigatorScreenProps<'ContractsModal'>;

export const ContractsModal = ({ route }: ContractsModalProps) => {
  const disabled = route.params.disabled && new Set(route.params.disabled);

  const { tokens } = useQuery(Query).data;

  return (
    <Screen>
      <Appbar mode="small" inset={false} leading="close" headline="Contracts" />

      <FlashList
        data={['Tokens', ...tokens]}
        renderItem={({ item }) =>
          match(item)
            .with(P.string, (s) => <ListHeader>{s}</ListHeader>)
            .with({ __typename: 'Token' }, (t) => (
              <ListItem
                leading={(props) => <TokenIcon token={t} {...props} />}
                leadingSize="medium"
                headline={t.name}
                supporting={truncateAddr(t.address)}
                trailing={NavigateNextIcon}
                disabled={disabled?.has(t.address)}
                onPress={() => CONTRACT_EMITTER.emit(t.address)}
              />
            ))
            .exhaustive()
        }
        getItemType={(item) =>
          match(item)
            .with(P.string, () => 'header')
            .otherwise((t) => t.__typename)
        }
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};
