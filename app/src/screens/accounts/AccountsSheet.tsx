import { useRef } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccountIds } from '@api/account';
import {
  useSelectedAccountId,
  useSetSelectedAccount,
} from '~/components/AccountSelector/useSelectedAccount';
import { ListHeader } from '~/components/list/ListHeader';
import { NavigateNextIcon } from '@theme/icons';
import { AddressLabel } from '~/components/address/AddressLabel';
import { ListItem } from '~/components/list/ListItem';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export type AccountsSheetProps = StackNavigatorScreenProps<'AccountsSheet'>;

export const AccountsSheet = ({ navigation: { navigate, goBack } }: AccountsSheetProps) => {
  const ref = useRef<BottomSheet>(null);
  const [selected, setSelected] = [useSelectedAccountId(), useSetSelectedAccount()];

  return (
    <Sheet ref={ref} onClose={goBack}>
      <BottomSheetFlatList
        data={useAccountIds()}
        ListHeaderComponent={
          <ListHeader
            trailing={
              <Button mode="text" onPress={() => navigate('CreateAccount')}>
                Create
              </Button>
            }
          >
            Accounts
          </ListHeader>
        }
        renderItem={({ item: account }) => (
          <ListItem
            leading={account}
            headline={<AddressLabel address={account} />}
            trailing={NavigateNextIcon}
            selected={account === selected}
            onPress={() => {
              setSelected(account);
              ref.current?.close();
            }}
          />
        )}
        contentContainerStyle={styles.contentContaiiner}
        showsVerticalScrollIndicator={false}
      />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  contentContaiiner: {
    paddingBottom: 16,
  },
});
