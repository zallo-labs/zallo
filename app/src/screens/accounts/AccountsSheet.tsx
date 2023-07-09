import { useRef } from 'react';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ListHeader } from '~/components/list/ListHeader';
import { AddIcon, NavigateNextIcon, PolicyIcon } from '@theme/icons';
import { AddressLabel } from '~/components/address/AddressLabel';
import { ListItem } from '~/components/list/ListItem';
import { Button, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Address } from 'lib';
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import {
  AccountsSheetDocument,
  AccountsSheetQuery,
  AccountsSheetQueryVariables,
} from '@api/generated';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';
import { makeStyles } from '@theme/makeStyles';
import { truncateAddr } from '~/util/format';

gql(/* GraphQL */ `
  query AccountsSheet {
    accounts {
      id
      address
      name
    }
  }
`);

export interface AccountsSheetParams {
  account: Address;
}

export type AccountsSheetProps = StackNavigatorScreenProps<'AccountsSheet'>;

export const AccountsSheet = ({ route, navigation: { navigate, goBack } }: AccountsSheetProps) => {
  const { account: selectedAddress } = route.params;
  const styles = useStyles();
  const ref = useRef<BottomSheet>(null);

  const accounts = useSuspenseQuery<AccountsSheetQuery, AccountsSheetQueryVariables>(
    AccountsSheetDocument,
  ).data.accounts;

  const selected = accounts.find((account) => account.address === selectedAddress);
  const otherAccounts = accounts.filter((account) => account.address !== selectedAddress);

  return (
    <Sheet ref={ref} onClose={goBack}>
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContaiiner}
        showsVerticalScrollIndicator={false}
      >
        {selected && (
          <View style={styles.selectedContainer}>
            <AddressIcon address={selected.address} size={ICON_SIZE.large} />

            <View style={styles.selectedLabelContainer}>
              <Text variant="titleMedium">{selected.name}</Text>
              <Text variant="bodyLarge" style={styles.selectedAddress}>
                {truncateAddr(selected.address)}
              </Text>
            </View>

            <Button
              mode="contained"
              icon={PolicyIcon}
              style={styles.selectedAccountButton}
              onPress={() => navigate('Account', { account: selected.address })}
            >
              Account
            </Button>
          </View>
        )}

        <ListHeader>Accounts</ListHeader>

        {otherAccounts.map((a) => (
          <ListItem
            key={a.address}
            leading={a.address}
            headline={<AddressLabel address={a.address} />}
            trailing={NavigateNextIcon}
            onPress={() => navigate('Home', { account: a.address })}
          />
        ))}

        <ListItem
          leading={(props) => (
            <View style={styles.addIconContainer}>
              <AddIcon {...props} />
            </View>
          )}
          headline="Account"
          onPress={() => navigate('CreateAccount', {})}
        />
      </BottomSheetScrollView>
    </Sheet>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  contentContaiiner: {
    paddingBottom: 16,
  },
  selectedContainer: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectedLabelContainer: {
    alignItems: 'center',
  },
  selectedAddress: {
    color: colors.onSurfaceVariant,
  },
  selectedAccountButton: {
    alignSelf: 'stretch',
  },
  addIconContainer: {
    alignItems: 'center',
    width: ICON_SIZE.medium,
  },
}));
