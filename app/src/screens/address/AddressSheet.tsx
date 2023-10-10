import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ContactsIcon, NavigateNextIcon, TransferIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { Address } from 'lib';
import { StyleSheet } from 'react-native';

export interface AddressSheetScreenParams {
  account: Address;
  address: Address;
}

export type AddressSheetProps = StackNavigatorScreenProps<'AddressSheet'>;

export const AddressSheet = ({ route, navigation: { replace, goBack } }: AddressSheetProps) => {
  const { account, address } = route.params;

  return (
    <Sheet onClose={goBack} handle={false} contentContainerStyle={styles.contentContainer}>
      <ListItem
        leading={TransferIcon}
        headline="Send"
        trailing={NavigateNextIcon}
        onPress={() => replace('Send', { account, to: address })}
      />

      <ListItem
        leading={ContactsIcon}
        headline="Add as contact"
        trailing={NavigateNextIcon}
        onPress={() => replace('Contact', { address })}
      />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 16,
  },
});
