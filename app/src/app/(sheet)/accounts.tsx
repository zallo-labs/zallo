import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Sheet } from '#/sheet/Sheet';
import { ListHeader } from '#/list/ListHeader';
import { AddIcon, CheckCircleIcon, materialCommunityIcon } from '@theme/icons';
import { ListItem } from '#/list/ListItem';
import { View } from 'react-native';
import { gql } from '@api/generated';
import { ICON_SIZE } from '@theme/paper';
import { AccountItem } from '#/item/AccountItem';
import { useQuery } from '~/gql';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { createStyles, useStyles } from '@theme/styles';

const SwitchIcon = materialCommunityIcon('swap-horizontal');

const Query = gql(/* GraphQL */ `
  query AccountsSheet {
    accounts {
      id
      address
      name
      ...AccountItem_Account
    }
  }
`);

export default function AccountsSheet() {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const selectedAddress = useSelectedAccount();

  const { accounts } = useQuery(Query).data;

  const goBackOnClose = useRef(true);

  return (
    <Sheet
      onClose={() => {
        if (goBackOnClose.current) router.back();
        goBackOnClose.current = true;
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContaiiner}
        showsVerticalScrollIndicator={false}
      >
        <ListHeader>Accounts</ListHeader>

        {accounts.map((a) => (
          <AccountItem
            key={a.id}
            account={a}
            trailing={a.address === selectedAddress ? CheckCircleIcon : SwitchIcon}
            onPress={() =>
              router.push({
                pathname: `/(drawer)/[account]/(home)/`,
                params: { account: a.address },
              })
            }
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
            router.push(`/accounts/create`);
          }}
        />
      </BottomSheetScrollView>
    </Sheet>
  );
}

const stylesheet = createStyles(({ colors }) => ({
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
