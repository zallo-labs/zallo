import { useRef } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useAccountIds } from '@api/account';
import {
  useSelectedAccountId,
  useSetSelectedAccount,
} from '~/components/AccountSelector/useSelectedAccount';
import { ListHeader } from '~/components/list/ListHeader';
import { NavigateNextIcon } from '@theme/icons';
import { AddressLabel } from '~/components/addr/AddressLabel';
import { ListItem } from '~/components/list/ListItem';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export type AccountsSheetScreenProps = StackNavigatorScreenProps<'AccountsSheet'>;

export const AccountsSheetScreen = ({ navigation: { navigate } }: AccountsSheetScreenProps) => {
  const ref = useRef<BottomSheet>(null);
  const [selected, setSelected] = [useSelectedAccountId(), useSetSelectedAccount()];

  return (
    <Sheet ref={ref} onClose={useGoBack()}>
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
        showsVerticalScrollIndicator={false}
      />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 0,
  },
});
