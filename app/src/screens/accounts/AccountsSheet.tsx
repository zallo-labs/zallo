import { useRef } from 'react';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Sheet } from '~/components/sheet/Sheet';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ListHeader } from '~/components/list/ListHeader';
import { AddIcon, PolicyIcon, materialCommunityIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { Button, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Address } from 'lib';
import { gql } from '@api/generated';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';
import { makeStyles } from '@theme/makeStyles';
import { truncateAddr } from '~/util/format';
import { AccountItem } from '../../components/item/AccountItem';
import { useQuery } from '~/gql';

const SwitchIcon = materialCommunityIcon('swap-horizontal');

const Query = gql(/* GraphQL */ `
  query AccountsSheet {
    accounts {
      id
      address
      name
      ...AccountItem_AccountFragment
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

  const { accounts } = useQuery(Query).data;

  const selected = accounts.find((account) => account.address === selectedAddress);
  const otherAccounts = accounts.filter((account) => account.address !== selectedAddress);

  const goBackOnClose = useRef(true);

  return (
    <Sheet
      ref={ref}
      onClose={() => {
        if (goBackOnClose.current) goBack();
        goBackOnClose.current = true;
      }}
    >
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
              Settings
            </Button>
          </View>
        )}

        {otherAccounts.length > 0 && <ListHeader>Accounts</ListHeader>}

        {otherAccounts.map((a) => (
          <AccountItem
            key={a.id}
            account={a}
            trailing={SwitchIcon}
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
          onPress={() => {
            goBackOnClose.current = false;
            navigate('CreateAccount', {});
          }}
        />
      </BottomSheetScrollView>
    </Sheet>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  contentContaiiner: {
    paddingBottom: 8,
  },
  selectedContainer: {
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
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
