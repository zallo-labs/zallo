import { useRouter } from 'expo-router';
import { Sheet } from '~/components/sheet/Sheet';
import { ContactsIcon, NavigateNextIcon, TransferIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { StyleSheet } from 'react-native';
import { z } from 'zod';
import { zAddress, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { asUAddress } from 'lib';
import { useSelectedChain } from '~/hooks/useSelectedAccount';

const ScannedAddressSheetParams = z.object({
  address: zAddress(),
  account: zUAddress().optional(),
});

export default function ScannedAddressSheet() {
  const { address, account } = useLocalParams(ScannedAddressSheetParams);
  const router = useRouter();
  const chain = useSelectedChain();

  return (
    <Sheet handle={false} contentContainerStyle={styles.contentContainer}>
      {account && (
        <ListItem
          leading={TransferIcon}
          headline="Send"
          trailing={NavigateNextIcon}
          onPress={() =>
            router.replace({
              pathname: `/(drawer)/[account]/transfer`,
              params: { account, to: address },
            })
          }
        />
      )}

      <ListItem
        leading={ContactsIcon}
        headline="Add as contact"
        trailing={NavigateNextIcon}
        onPress={() =>
          router.replace({
            pathname: `/(drawer)/contacts/[address]`,
            params: { address: asUAddress(address, chain) },
          })
        }
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 16,
  },
});
