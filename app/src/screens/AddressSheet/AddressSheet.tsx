import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { ContactsIcon, NavigateNextIcon, SendIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { Address } from 'lib';

export interface AddressSheetScreenParams {
  address: Address;
}

export type AddressSheetProps = StackNavigatorScreenProps<'AddressSheet'>;

export const AddressSheet = ({ route, navigation: { navigate } }: AddressSheetProps) => {
  const { address } = route.params;

  return (
    <Sheet onClose={useGoBack()} handle={false}>
      <ListItem
        leading={SendIcon}
        headline="Send"
        trailing={NavigateNextIcon}
        onPress={() => navigate('Send', { to: address })}
      />

      <ListItem
        leading={ContactsIcon}
        headline="Add as contact"
        trailing={NavigateNextIcon}
        onPress={() => navigate('Contact', { address })}
      />
    </Sheet>
  );
};
