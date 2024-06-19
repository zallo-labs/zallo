import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Sheet } from '#/sheet/Sheet';
import { gql } from '@api/generated';
import { AccountItem } from '#/item/AccountItem';
import { useQuery } from '~/gql';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';
import { createStyles, useStyles } from '@theme/styles';
import { Divider, RadioButton, Text } from 'react-native-paper';
import { PressableOpacity } from '#/PressableOpacity';
import { View } from 'react-native';
import { AddIcon, QrCodeIcon } from '@theme/icons';

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
      contentContainer={false}
      onClose={() => {
        if (goBackOnClose.current) router.back();
        goBackOnClose.current = true;
      }}
    >
      <BottomSheetFlatList
        ListHeaderComponent={
          <>
            <View style={styles.actions}>
              <PressableOpacity
                style={styles.action}
                onPress={() => {
                  goBackOnClose.current = false;
                  router.push(`/accounts/create`);
                }}
              >
                <AddIcon />
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Create account
                </Text>
              </PressableOpacity>

              <PressableOpacity
                style={styles.action}
                onPress={() => {
                  goBackOnClose.current = false;
                  router.push(`/accounts/join`);
                }}
              >
                <QrCodeIcon />
                <Text variant="labelLarge" style={styles.actionLabel}>
                  Join account
                </Text>
              </PressableOpacity>
            </View>

            <Divider horizontalInset style={styles.divider} />
          </>
        }
        data={accounts}
        renderItem={({ item: a }) => (
          <AccountItem
            account={a}
            trailing={
              <RadioButton
                value={a.address}
                status={selectedAddress === a.address ? 'checked' : 'unchecked'}
              />
            }
            onPress={() =>
              router.push({
                pathname: `/(drawer)/[account]/(home)/`,
                params: { account: a.address },
              })
            }
          />
        )}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.contentContainer}
      />
    </Sheet>
  );
}

const stylesheet = createStyles(({ colors, corner }, { insets }) => ({
  contentContainer: {
    paddingBottom: insets.bottom + 8,
  },
  selectedAddress: {
    color: colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  action: {
    alignItems: 'center',
    gap: 8,
    width: 80,
    paddingVertical: 8,
    borderRadius: corner.m,
  },
  actionLabel: {
    textAlign: 'center',
  },
  divider: {
    marginVertical: 8,
  },
}));

export { ErrorBoundary } from '#/ErrorBoundary';
